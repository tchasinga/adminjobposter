/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/signin/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/app/models/user.models';
import rateLimit from '@/lib/rate-limit';

// Rate limiter configuration (5 requests per 15 minutes)
const limiter = rateLimit({
  interval: 15 * 60 * 1000,
  uniqueTokenPerInterval: 500,
  tokensPerInterval: 5,
});

export async function POST(request: Request) {
  // Apply rate limiting
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  const isRateLimited = await limiter.check(identifier);

  if (isRateLimited) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429, 
        headers: { 
          'Retry-After': '900',
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0'
        } 
      }
    );
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Parse and validate request body
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email })
      .select('+password +loginAttempts +lockedUntil')
      .maxTimeMS(5000)
      .exec();

    // Account lock check
    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (1000 * 60));
      return NextResponse.json(
        { error: `Account temporarily locked. Try again in ${remainingMinutes} minute(s).` },
        { status: 403 }
      );
    }

    // Verify credentials
    const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;
    
    if (!user || !isPasswordValid) {
      // Increment failed attempts if user exists
      if (user) {
        user.loginAttempts += 1;
        
        // Lock account after 5 failed attempts
        if (user.loginAttempts >= 5) {
          user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lock
          await user.save();
          
          return NextResponse.json(
            { error: 'Too many failed attempts. Account locked for 30 minutes.' },
            { status: 403 }
          );
        }
        
        await user.save();
      }

      // Generic error to prevent user enumeration
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Reset login attempts on success
    if (user.loginAttempts > 0 || user.lockedUntil) {
      user.loginAttempts = 0;
      user.lockedUntil = null;
      await user.save();
    }

    // JWT token generation
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const tokenPayload = {
      userId: user._id,
      email: user.email,
      isAdmin: user.admins || false
    };

    const accessToken = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { 
        expiresIn: '15m',
        issuer: 'your-app-name',
        audience: ['web', 'mobile']
      }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET + user.password,
      { expiresIn: '7d' }
    );

    // Secure response without password
    const userResponse = {
      _id: user._id,
      email: user.email,
      admins: user.admins,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Create response with HTTP-only cookies
    const response = NextResponse.json(
      {
        user: userResponse,
        message: 'Authentication successful'
      },
      { status: 200 }
    );

    // Set secure cookies
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/api/auth/refresh',
      domain: process.env.COOKIE_DOMAIN || undefined
    });

    // Additional security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;

  } catch (error: any) {
    console.error('Sign-in error:', error);

    const isDatabaseError = error.name?.includes('Mongo') || 
                         error.name?.includes('Mongoose') ||
                         error.message?.includes('Database');

    return NextResponse.json(
      { 
        error: isDatabaseError ? 'Service unavailable' : 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      },
      { 
        status: isDatabaseError ? 503 : 500,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }
}
