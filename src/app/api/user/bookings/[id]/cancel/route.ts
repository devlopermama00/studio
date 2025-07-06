
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
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

// POST handler for a user to request cancellation
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const userCheck = await verifyUser(request);
    if (userCheck instanceof NextResponse) return userCheck;
    const userId = userCheck.id;

    try {
        await dbConnect();

        const bookingId = params.id;
        if (!Types.ObjectId.isValid(bookingId)) {
            return NextResponse.json({ message: 'Invalid booking ID' }, { status: 400 });
        }
        
        const booking = await Booking.findOne({ _id: bookingId, userId });

        if (!booking) {
            return NextResponse.json({ message: 'Booking not found or you do not have permission to cancel it.' }, { status: 404 });
        }
        
        if (booking.status !== 'confirmed') {
            return NextResponse.json({ message: `Cannot request cancellation for a booking with status: ${booking.status}` }, { status: 400 });
        }

        // Add business logic for refund eligibility here
        const tourDate = new Date(booking.bookingDate);
        const now = new Date();
        const hoursUntilTour = (tourDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        const isEligible = hoursUntilTour > 24;

        booking.status = 'cancellation-requested';
        booking.cancellationDetails = {
            cancelledBy: 'user',
            cancellationReason: 'User requested cancellation',
            refundRequestedAt: new Date(),
            refundEligible: isEligible
        };

        await booking.save();
        
        return NextResponse.json(booking);

    } catch (error) {
        console.error('Error requesting booking cancellation:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while requesting cancellation.', error: errorMessage }, { status: 500 });
    }
}
