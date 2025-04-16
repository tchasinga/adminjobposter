/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/signup/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/app/models/user.models';

export async function POST(request: Request) {
  try {
    // Connect to database with timeout handling
    await connectToDatabase().catch(err => {
      console.error('Database connection error:', err);
      throw new Error('Database connection failed');
    });

    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email and password are required' },
        { status: 400 }
      );
    }

    // Add email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user exists with timeout (either by email or username)
    const existingUser = await User.findOne({
      $or: [
        { email },
        { username }
      ]
    })
      .maxTimeMS(5000) // 5 second timeout
      .exec()
      .catch(err => {
        console.error('Database query error:', err);
        throw new Error('Database operation failed');
      });

    if (existingUser) {
      const conflictField = existingUser.email === email ? 'email' : 'username';
      return NextResponse.json(
        { error: `User with this ${conflictField} already exists` },
        { status: 409 }
      );
    }

    const user = new User({ username, email, password });
    const savedUser = await user.save();

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign(
      { userId: savedUser._id, email: savedUser.email, username: savedUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const userWithoutPassword = savedUser.toObject();
    if ('password' in userWithoutPassword) {
      delete (userWithoutPassword as { password?: string }).password;
    }

    return NextResponse.json(
      { 
        user: userWithoutPassword, 
        token,
        message: 'Signup successful' 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Signup error:', error.message);
    
    const status = error.message.includes('Database') ? 503 : 500;
    const message = status === 503 
      ? 'Service unavailable' 
      : 'Internal server error';

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}