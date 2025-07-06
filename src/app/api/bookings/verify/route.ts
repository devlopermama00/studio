
import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Tour from '@/models/Tour';
import User from '@/models/User';
import Booking from '@/models/Booking';
import { Stripe } from 'stripe';
import { Types } from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ message: 'Session ID is required.' }, { status: 400 });
    }
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.status !== 'complete') {
        return NextResponse.json({ message: 'Checkout session is not complete.' }, { status: 400 });
    }

    if (!session.metadata) {
         return NextResponse.json({ message: 'Missing booking metadata.' }, { status: 400 });
    }

    await dbConnect();
    
    // Check if a booking with this payment intent already exists
    const existingBooking = await Booking.findOne({ stripePaymentId: session.id });
    if (existingBooking) {
      return NextResponse.json({ message: 'Booking already exists for this payment.', bookingId: existingBooking._id }, { status: 200 });
    }

    const { tourId, userId, bookingDate, guests, totalPrice } = session.metadata;

    const newBooking = new Booking({
        tourId: new Types.ObjectId(tourId),
        userId: new Types.ObjectId(userId),
        bookingDate: new Date(bookingDate),
        guests: Number(guests),
        totalPrice: Number(totalPrice),
        stripePaymentId: session.id,
        status: 'confirmed'
    });
    
    await newBooking.save();

    return NextResponse.json({ message: 'Booking verified and created successfully.', bookingId: newBooking._id }, { status: 201 });

  } catch (error) {
    console.error('Booking verification error:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: `An error occurred: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred during booking verification.' }, { status: 500 });
  }
}
