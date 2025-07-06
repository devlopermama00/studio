
import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

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
    
    // Assign 'admin' role if the email matches the designated admin email from environment variables
    const finalRole = (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL) ? 'admin' : role;

    const newUser = new User({
      username: email,
      name,
      email,
      passwordHash,
      role: finalRole,
    });

    await newUser.save();

    return NextResponse.json({ message: 'User created successfully', userId: newUser._id }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return NextResponse.json({ message: `Validation failed: ${messages}` }, { status: 400 });
    }

    if (error instanceof Error) {
        if (error.message.includes('E11000')) {
             return NextResponse.json({ message: 'A user with this email or username already exists.' }, { status: 409 });
        }
        if (error.message.includes('timed out') || error.message.includes('querySrv ESERVFAIL')) {
             return NextResponse.json({ message: 'Database connection failed. Please ensure your MongoDB Atlas IP access list allows connections from all IPs (0.0.0.0/0).' }, { status: 500 });
        }
        return NextResponse.json({ message: error.message || 'An error occurred during registration.' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'An unknown error occurred during registration.' }, { status: 500 });
  }
}
