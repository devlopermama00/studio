
import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcryptjs.hash(password, 10);
    
    // Assign 'admin' role if the email matches the designated admin email
    const finalRole = email === 'admin@tourvista.ge' ? 'admin' : role;

    const newUser = new User({
      name,
      email,
      passwordHash,
      role: finalRole,
    });

    await newUser.save();

    return NextResponse.json({ message: 'User created successfully', userId: newUser._id }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'An error occurred during registration.', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred during registration.' }, { status: 500 });
  }
}
