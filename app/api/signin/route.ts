/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/signin/route.ts (updated version)
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/app/models/user.models';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 15 * 60 * 1000,
  uniqueTokenPerInterval: 500,
  tokensPerInterval: 5,
});

export async function POST(request: Request) {
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
    await connectToDatabase();
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user and lock document for update
    const user = await User.findOneAndUpdate(
      { email },
      { $setOnInsert: { loginAttempts: 0 } }, // Initialize if new
      { 
        new: true,
        upsert: false,
        select: '+password +loginAttempts +lockedUntil',
        maxTimeMS: 5000
      }
    );

    // Check if account is locked
    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (1000 * 60));
      return NextResponse.json(
        { error: `Account locked. Try again in ${remainingMinutes} minute(s).` },
        { status: 403 }
      );
    }

    // Verify credentials
    const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;
    
    if (!user || !isPasswordValid) {
      // Increment failed attempts atomically
      if (user) {
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { 
            $inc: { loginAttempts: 1 },
            $set: { 
              lockedUntil: user.loginAttempts + 1 >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null 
            }
          },
          { new: true }
        );

        if ((updatedUser?.loginAttempts ?? 0) >= 5) {
          return NextResponse.json(
            { error: 'Account locked for 30 minutes due to too many failed attempts.' },
            { status: 403 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Reset attempts on successful login (atomic operation)
    if (user.loginAttempts > 0 || user.lockedUntil) {
      await User.findByIdAndUpdate(
        user._id,
        { 
          $set: { 
            loginAttempts: 0,
            lockedUntil: null
          } 
        }
      );
    }

    // JWT token generation
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        isAdmin: user.admins || false
      },
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
      { expiresIn: '1d' }
    );

    const response = NextResponse.json(
      {
        user: {
          _id: user._id,
          email: user.email,
          admins: user.admins,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        message: 'Authentication successful'
      },
      { status: 200 }
    );

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/'
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60,
    });

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