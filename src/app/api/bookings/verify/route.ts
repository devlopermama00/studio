
import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { Stripe } from 'stripe';
import { headers } from 'next/headers';
import { Types } from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// This endpoint is for Stripe webhooks to verify payments and create bookings.
export async function POST(req: NextRequest) {
  try {
    const buf = await req.text();
    const sig = headers().get('stripe-signature');

    if (!sig) {
        console.error('❌ Missing stripe-signature header');
        return new NextResponse('Webhook Error: Missing stripe-signature header', { status: 400 });
    }
    
    if (!webhookSecret) {
        console.error('❌ Missing STRIPE_WEBHOOK_SECRET');
        return new NextResponse('Webhook Error: Webhook secret is not configured.', { status: 500 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.log(`❌ Webhook signature verification failed: ${errorMessage}`);
      return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
    }

    // Successfully constructed event.
    console.log('✅ Success:', event.id);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extract metadata
      const { tourId, userId, bookingDate, guests, totalPrice } = session.metadata || {};
      
      if (!tourId || !userId || !bookingDate || !guests || !totalPrice) {
        console.error('Webhook Error: Missing metadata from checkout session.');
        return new NextResponse('Webhook Error: Missing metadata.', { status: 400 });
      }

      // Robustly get payment intent ID
      const paymentIntentId = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;
      
      if (!paymentIntentId) {
        console.error('Webhook Error: Could not extract Payment Intent ID from session.');
        return new NextResponse('Webhook Error: Missing Payment Intent ID.', { status: 400 });
      }

      try {
        await dbConnect();
        
        const newBooking = new Booking({
          tourId: new Types.ObjectId(tourId),
          userId: new Types.ObjectId(userId),
          bookingDate: new Date(bookingDate),
          guests: parseInt(guests, 10),
          totalPrice: parseFloat(totalPrice),
          paymentId: paymentIntentId, 
          status: 'confirmed',
        });

        await newBooking.save();
        console.log(`Booking created successfully: ${newBooking._id}`);

      } catch (dbError) {
        console.error('Database error on webhook processing:', dbError);
        return new NextResponse('Webhook database error', { status: 500 });
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Unhandled error in Stripe webhook handler:', error);
    return new NextResponse('Internal Server Error in webhook.', { status: 500 });
  }
}
