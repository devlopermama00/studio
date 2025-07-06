
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Review from '@/models/Review';
import { Types } from 'mongoose';

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

async function verifyUser(request: NextRequest): Promise<NextResponse | DecodedToken> {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        return decoded;
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}

export async function GET(request: NextRequest) {
    const userCheck = await verifyUser(request);
    if (userCheck instanceof NextResponse) return userCheck;
    const userId = new Types.ObjectId(userCheck.id);

    try {
        await dbConnect();
        
        const upcomingBookingsPromise = Booking.countDocuments({ userId: userId, status: 'confirmed' });
        const completedToursPromise = Booking.countDocuments({ userId: userId, status: 'completed' });
        const reviewsWrittenPromise = Review.countDocuments({ userId: userId });

        const [
            upcomingBookings,
            completedTours,
            reviewsWritten
        ] = await Promise.all([
            upcomingBookingsPromise,
            completedToursPromise,
            reviewsWrittenPromise
        ]);

        return NextResponse.json({
            upcomingBookings,
            completedTours,
            reviewsWritten,
        });

    } catch (error) {
        console.error('Error fetching user stats:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while fetching stats.', error: errorMessage }, { status: 500 });
    }
}
