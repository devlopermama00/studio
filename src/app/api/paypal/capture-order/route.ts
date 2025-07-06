import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { capturePayPalOrder } from '@/lib/paypal';
import { Types } from 'mongoose';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

interface DecodedToken {
    id: string;
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const user = payload as DecodedToken;

        const { orderId, tourId, bookingDate, guests } = await request.json();
        if (!orderId || !tourId || !bookingDate || !guests) {
            return NextResponse.json({ message: 'Missing required data to capture order.' }, { status: 400 });
        }

        await dbConnect();
        
        // Check if a booking with this payment intent already exists
        const existingBooking = await Booking.findOne({ paymentId: orderId });
        if (existingBooking) {
            return NextResponse.json({ message: 'Booking already processed for this payment.', bookingId: existingBooking._id }, { status: 200 });
        }

        const captureData = await capturePayPalOrder(orderId);
        
        if (captureData.status !== 'COMPLETED') {
            return NextResponse.json({ message: 'Payment could not be completed.' }, { status: 402 });
        }
        
        const purchaseUnit = captureData.purchase_units[0];
        const capture = purchaseUnit?.payments?.captures?.[0];

        if (!capture) {
            throw new Error('Could not find capture details in PayPal response.');
        }
        
        const newBooking = new Booking({
            tourId: new Types.ObjectId(tourId),
            userId: new Types.ObjectId(user.id),
            bookingDate: new Date(bookingDate),
            guests: Number(guests),
            totalPrice: parseFloat(capture.amount.value),
            paymentId: capture.id, // Save the transaction ID, not the order ID
            status: 'confirmed'
        });
        
        await newBooking.save();

        return NextResponse.json({ success: true, bookingId: newBooking._id });

    } catch (error) {
        console.error('PayPal Capture Order error:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: `Failed to capture order: ${message}` }, { status: 500 });
    }
}
