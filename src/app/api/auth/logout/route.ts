import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const response = NextResponse.json({
      message: "Logout successful",
      success: true,
    }, { status: 200 });
    
    // Clear the token cookie
    response.cookies.set('token', '', { 
      httpOnly: true, 
      expires: new Date(0), 
      path: '/' 
    });

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'An error occurred during logout.' }, { status: 500 });
  }
}
