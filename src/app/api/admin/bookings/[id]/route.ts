
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { Types } from 'mongoose';

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

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();

        const bookingId = params.id;
        if (!Types.ObjectId.isValid(bookingId)) {
            return NextResponse.json({ message: 'Invalid booking ID' }, { status: 400 });
        }
        
        const body = await request.json();
        const { status } = body;
        
        if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status provided' }, { status: 400 });
        }
        
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { status },
            { new: true }
        )
        .populate({ path: 'userId', select: 'name email' })
        .populate({ path: 'tourId', select: 'title' });


        if (!updatedBooking) {
            return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
        }

        return NextResponse.json(updatedBooking);
    } catch (error) {
        console.error('Error updating booking:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while updating the booking.', error: errorMessage }, { status: 500 });
    }
}
