import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
    }
    
    // Find user by email, ensuring the search is case-insensitive
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (user.isBlocked) {
        return NextResponse.json({ message: 'This account has been blocked.' }, { status: 403 });
    }

    // Create token data
    const tokenData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Create token
    const token = jwt.sign(tokenData, process.env.JWT_SECRET!, { expiresIn: '1d' });

    const response = NextResponse.json({
        message: 'Login successful',
        success: true,
    }, { status: 200 });

    response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'An error occurred during login.', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred during login.' }, { status: 500 });
  }
}
