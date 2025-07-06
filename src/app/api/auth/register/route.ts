
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

    await dbConnect();
    
    // The User model now handles converting email to lowercase automatically.
    const existingUser = await User.findOne({ email: email });
    
    if (existingUser) {
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await bcryptjs.hash(password, 10);
    const finalRole = (process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL) ? 'admin' : role;
    
    const newUser = new User({
      name,
      email, // Mongoose will automatically convert this to lowercase due to the schema
      passwordHash,
      role: finalRole,
    });

    await newUser.save();

    return NextResponse.json({ message: 'User created successfully', userId: newUser._id }, { status: 201 });

  } catch (error: any) {
    console.error('Full registration error:', JSON.stringify(error, null, 2));

    if (error.code === 11000) {
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
    }
    
    if (error instanceof mongoose.Error.MongooseServerSelectionError || error.name === 'MongoNetworkError') {
      return NextResponse.json({ message: 'Database connection failed. Please ensure your MongoDB Atlas IP access list is correctly configured.' }, { status: 500 });
    }
    
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return NextResponse.json({ message: `Validation failed: ${messages}` }, { status: 400 });
    }

    return NextResponse.json({ message: 'An unknown error occurred during registration.', error: error.message || 'No error message available.' }, { status: 500 });
  }
}
