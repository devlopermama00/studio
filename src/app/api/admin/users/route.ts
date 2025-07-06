
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        
        if (decoded.role !== 'admin') {
             return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();

        const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 });

        return NextResponse.json(users);

    } catch (error) {
        console.error('Error fetching users:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }
        return NextResponse.json({ message: 'An error occurred while fetching users.' }, { status: 500 });
    }
}
