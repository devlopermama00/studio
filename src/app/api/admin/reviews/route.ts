
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

async function verifyAdmin(request: NextRequest): Promise<NextResponse | DecodedToken> {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        if (decoded.role !== 'admin') {
             return NextResponse.json({ message: 'Unauthorized: Admins only' }, { status: 403 });
        }
        return decoded;
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}


export async function GET(request: NextRequest) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();
        
        const reviews = await Review.find({})
            .populate({ path: 'userId', select: 'name email' })
            .populate({ path: 'tourId', select: 'title' })
            .sort({ createdAt: -1 });

        return NextResponse.json(reviews);

    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ message: 'An error occurred while fetching reviews.' }, { status: 500 });
    }
}
