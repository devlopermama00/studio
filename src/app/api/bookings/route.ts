
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Tour from '@/models/Tour';
import { Types } from 'mongoose';

interface DecodedToken {
    id: string;
}

// Needed to reference the models so they are initialized by Mongoose
User;
Tour;

export async function GET(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        const userId = new Types.ObjectId(decoded.id);

        const bookings = await Booking.find({ userId: userId })
            .populate({
                path: 'tourId',
                select: 'title images city',
                model: Tour,
            })
            .sort({ bookingDate: -1 })
            .lean();

        return NextResponse.json(bookings);

    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({ message: 'An error occurred while fetching bookings.' }, { status: 500 });
    }
}
