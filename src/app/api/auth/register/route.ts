
import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Ensure database is connected before proceeding
    await dbConnect();

    const lowercasedEmail = email.toLowerCase();
    
    // Explicitly check if user exists in a way that is robust to case sensitivity
    const existingUser = await User.findOne({ email: lowercasedEmail }).lean().exec();
    
    if (existingUser) {
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
    }

    // Hash the password and determine the final role
    const passwordHash = await bcryptjs.hash(password, 10);
    const finalRole = (process.env.ADMIN_EMAIL && lowercasedEmail === process.env.ADMIN_EMAIL) ? 'admin' : role;
    
    const newUser = new User({
      name,
      email: lowercasedEmail,
      passwordHash,
      role: finalRole,
    });

    // Attempt to save the new user
    await newUser.save();

    return NextResponse.json({ message: 'User created successfully', userId: newUser._id }, { status: 201 });

  } catch (error: any) {
    // Log the full error for better debugging
    console.error('Full registration error:', JSON.stringify(error, null, 2));

    // Check for specific MongoDB error codes and names
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A user with this email already exists (database conflict).' }, { status: 409 });
    }
    
    // Check for common network/connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError' || (error.message && error.message.includes('timed out'))) {
      return NextResponse.json({ message: 'Database connection failed. Please ensure your MongoDB Atlas IP access list is correctly configured to allow connections.' }, { status: 500 });
    }
    
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return NextResponse.json({ message: `Validation failed: ${messages}` }, { status: 400 });
    }

    // Fallback for any other errors
    return NextResponse.json({ message: 'An unknown error occurred during registration.', error: error.message || 'No error message available.' }, { status: 500 });
  }
}
