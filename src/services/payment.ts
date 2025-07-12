
'use server';

import Stripe from 'stripe';
import dbConnect from '@/lib/db';
import Tour from '@/models/Tour';
import User from '@/models/User';
import Booking from '@/models/Booking';
import { Types } from 'mongoose';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Create Stripe Checkout Session
export async function createCheckoutSession(
  tourId: string,
  userId: string,
  numberOfGuests: number,
  bookingDate: Date,
): Promise<{ sessionId: string } | { error: string }> {

  try {
    await dbConnect();

    const tour = await Tour.findById(tourId);
    if (!tour) throw new Error('Tour not found');
    
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const price = (tour.discountPrice && tour.offerExpiresAt && new Date(tour.offerExpiresAt) > new Date())
      ? tour.discountPrice
      : tour.price;

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: tour.currency,
          product_data: {
            name: tour.title,
            images: [tour.images[0]],
            description: tour.overview,
          },
          unit_amount: Math.round(price * 100), // Convert to cents
        },
        quantity: numberOfGuests,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tours/${tourId}`,
      metadata: {
        tourId: tour._id.toString(),
        userId: user._id.toString(),
        providerId: tour.createdBy.toString(),
        numberOfGuests: String(numberOfGuests),
        bookingDate: bookingDate.toISOString(),
        totalPrice: String(price * numberOfGuests),
        currency: tour.currency,
        customerName: user.name,
        customerEmail: user.email,
      },
    });

    if (!session.id) {
        throw new Error('Failed to create Stripe session');
    }

    return { sessionId: session.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error("Error creating checkout session:", message);
    return { error: message };
  }
}


// Handle Stripe Webhook Event
export async function handleStripeWebhook(req: Request) {
    const sig = headers().get('stripe-signature') as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
    
    if (!sig || !webhookSecret) {
        return new NextResponse('Webhook secret not configured.', { status: 400 });
    }

    let event: Stripe.Event;

    try {
        const body = await req.text();
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        
        try {
            await createBookingFromStripeSession(session);
        } catch (error) {
            console.error('Error creating booking from Stripe session:', error);
            return new NextResponse('Internal Server Error while creating booking', { status: 500 });
        }
    }

    return new NextResponse(null, { status: 200 });
}

// Helper to create booking from a completed Stripe session
async function createBookingFromStripeSession(session: Stripe.Checkout.Session) {
    const {
        tourId,
        userId,
        providerId,
        numberOfGuests,
        bookingDate,
        totalPrice,
        currency,
        customerName,
        customerEmail,
    } = session.metadata!;
    
    await dbConnect();
    
    const existingBooking = await Booking.findOne({ transactionId: session.id });
    if(existingBooking) {
        console.log(`Booking with session ID ${session.id} already exists.`);
        return;
    }

    const newBooking = new Booking({
        tourId: new Types.ObjectId(tourId),
        userId: new Types.ObjectId(userId),
        providerId: new Types.ObjectId(providerId),
        bookingDate: new Date(bookingDate),
        numberOfGuests: Number(numberOfGuests),
        totalPrice: Number(totalPrice),
        currency,
        paymentStatus: 'completed',
        transactionId: session.id,
        customerDetails: {
            name: customerName,
            email: customerEmail,
        },
        providerPayoutStatus: 'unpaid',
    });

    await newBooking.save();
    console.log(`Successfully created booking ${newBooking._id} for Stripe session ${session.id}`);
}
