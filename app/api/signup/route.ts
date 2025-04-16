/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
import { NextResponse } from 'next/server';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

// Constants and configuration
const PASSWORD_SALT_ROUNDS = 12;
const JWT_EXPIRATION = '1d';
const MIN_PASSWORD_LENGTH = 8;

// Define User type based on your Prisma model
type User = {
  id: string;
  name: string | null;
  email: string;
  password: string;
  createdAt: Date;
};

// Input validation schema
const SignupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

// Type for validated input
type SignupInput = z.infer<typeof SignupSchema>;

// Error response utility
class ErrorResponse extends Error {
  constructor(public statusCode: number, public message: string, public details?: any) {
    super(message);
  }

  toNextResponse() {
    return NextResponse.json(
      { 
        success: false, 
        message: this.message,
        ...(this.details && { details: this.details }) 
      },
      { status: this.statusCode }
    );
  }
}

// Initialize Prisma with singleton pattern
const prisma = new PrismaClient();

// Utility functions
async function validateInput(data: any): Promise<SignupInput> {
  try {
    return await SignupSchema.parseAsync(data);
  } catch (error) {
    throw new ErrorResponse(400, 'Validation failed', error);
  }
}

async function checkExistingUser(email: string): Promise<void> {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new ErrorResponse(409, 'User with this email already exists');
  }
}

async function createUser(userData: SignupInput): Promise<User> {
  const hashedPassword = await bcrypt.hash(userData.password, PASSWORD_SALT_ROUNDS);
  
  return await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
    },
  });
}

function generateAuthToken(userId: string): string {
  if (!process.env.JWT_SECRET_KEY) {
    throw new ErrorResponse(500, 'Server configuration error');
  }

  return jwt.sign({ sub: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRATION,
  });
}

// Main handler
export async function POST(req: Request) {
  try {
    // Validate request content type
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new ErrorResponse(415, 'Unsupported Media Type', {
        expected: 'application/json',
      });
    }

    // Parse and validate input
    const requestBody = await req.json();
    const validatedData = await validateInput(requestBody);

    // Check for existing user
    await checkExistingUser(validatedData.email);

    // Create user
    const user = await createUser(validatedData);

    // Generate token
    const token = generateAuthToken(user.id);

    // Prepare response data (excluding sensitive information)
    const responseData = {
      success: true,
        message: 'User created successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    };

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    // Handle known error types
    if (error instanceof ErrorResponse) {
      return error.toNextResponse();
    }

    // Handle unexpected errors
    console.error('Signup error:', error);
    return new ErrorResponse(500, 'Internal server error').toNextResponse();
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}

// Type safety for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET_KEY: string;
      DATABASE_URL: string;
    }
  }
}