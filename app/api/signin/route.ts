/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}
const prisma = new PrismaClient();

// adding signin route
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password }: { email: string; password: string } = body;

        // Check if the user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Compare the password
        if (!user.password) {
            return NextResponse.json({ message: 'Invalid password' }, { status: 400 });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Invalid password' }, { status: 400 });
        }

        const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY_JWT as string, {
            expiresIn: "1d",
        });

        return NextResponse.json({ 
            message: 'User signed in successfully', 
            user: {
                token,
                id: user.id,
                name: user.name,
                email: user.email,
            } 
        }, { status: 200 });
    } catch (error: any) {
        console.error('Error signing in user:', error.message);
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
    }
}