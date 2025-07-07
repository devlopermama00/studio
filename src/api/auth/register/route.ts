
import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Document from '@/models/Document';
import mongoose, { Types } from 'mongoose';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, currency, licenseUrl, idProofUrl } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (role === 'provider' && (!licenseUrl || !idProofUrl)) {
      return NextResponse.json({ message: 'License and ID documents are required for providers.' }, { status: 400 });
    }

    await dbConnect();
    
    const lowercasedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: lowercasedEmail });
    
    if (existingUser) {
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await bcryptjs.hash(password, 10);
    const isAdminByEnv = process.env.ADMIN_EMAIL && lowercasedEmail === process.env.ADMIN_EMAIL.toLowerCase();
    const finalRole = isAdminByEnv || lowercasedEmail === 'saurabhcsbs@gmail.com' ? 'admin' : role;
    
    const newUser = new User({
      name,
      username: lowercasedEmail,
      email: lowercasedEmail,
      passwordHash,
      role: finalRole,
      currency: currency,
    });

    await newUser.save();

    // If the new user is a provider, create a pending verification document
    if (finalRole === 'provider') {
        const newDocument = new Document({
            userId: new Types.ObjectId(newUser._id),
            licenseUrl: licenseUrl,
            idProofUrl: idProofUrl,
            status: 'pending'
        });
        await newDocument.save();
    }

    return NextResponse.json({ message: 'User created successfully', userId: newUser._id }, { status: 201 });

  } catch (error: any) {
    console.error('Full registration error:', JSON.stringify(error, null, 2));

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({ message: `A user with this ${field} already exists.` }, { status: 409 });
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
