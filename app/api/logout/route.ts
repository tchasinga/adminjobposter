/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Create response object
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );

    // Clear the access token cookie
    response.cookies.set('access_token', '', {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(0), // Set to past date to expire immediately
    });

    // Clear the refresh token cookie
    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(0), // Set to past date to expire immediately
    });

    // Alternative way to delete cookies (works in all environments)
    (await
          // Alternative way to delete cookies (works in all environments)
          cookies()).delete('access_token');
    (await cookies()).delete('refresh_token');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error during logout' },
      { status: 500 }
    );
  }
}