
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Tour from '@/models/Tour';
import User from '@/models/User';

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
    const userId = userCheck.id;

    try {
        await dbConnect();
        
        const bookings = await Booking.find({ userId: userId })
            .populate({
                path: 'tourId',
                select: 'title images',
                model: Tour,
            })
            .sort({ createdAt: -1 });

        const formattedBookings = bookings.map(booking => {
            const tour = booking.tourId as any; // Cast to access populated fields
            return {
                id: booking._id.toString(),
                tourId: tour?._id.toString(),
                tourTitle: tour?.title || 'Tour not found',
                tourImage: tour?.images?.[0] || 'https://placehold.co/800x600.png',
                bookingDate: booking.bookingDate.toISOString(),
                guests: booking.guests,
                totalPrice: booking.totalPrice,
                status: booking.status,
            };
        });
        
        return NextResponse.json(formattedBookings);

    } catch (error) {
        console.error('Error fetching user bookings:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while fetching bookings.', error: errorMessage }, { status: 500 });
    }
}
