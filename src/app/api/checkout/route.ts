
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Tour from '@/models/Tour';
import { Stripe } from 'stripe';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

interface DecodedToken {
    id: string;
    email: string;
    role: 'user' | 'provider' | 'admin';
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'SignIn required for booking tour' }, { status: 401 });
        }

        const { payload: user } = await jwtVerify(token, JWT_SECRET) as { payload: DecodedToken };

        const { tourId, bookingDate, guests } = await request.json();

        if (!tourId || !bookingDate || !guests) {
            return NextResponse.json({ message: 'Missing required booking information.' }, { status: 400 });
        }
        
        await dbConnect();
        
        const tour = await Tour.findById(tourId);

        if (!tour) {
            return NextResponse.json({ message: 'Tour not found.' }, { status: 404 });
        }

        const now = new Date();
        const isOfferActive = tour.discountPrice && tour.discountPrice > 0 && tour.offerExpiresAt && new Date(tour.offerExpiresAt) > now;
        const finalPricePerGuest = isOfferActive ? tour.discountPrice : tour.price;
        const totalPrice = finalPricePerGuest * guests;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: tour.currency.toLowerCase(),
                        product_data: {
                            name: tour.title,
                            images: tour.images,
                            description: `Booking for ${guests} guest(s) on ${new Date(bookingDate).toLocaleDateString()}.`
                        },
                        unit_amount: finalPricePerGuest * 100, // Stripe expects amount in cents
                    },
                    quantity: guests,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: request.headers.get('referer') || `${process.env.NEXT_PUBLIC_APP_URL}/tours/${tourId}`,
            customer_email: user.email,
            metadata: {
                tourId: tour._id.toString(),
                userId: user.id,
                bookingDate,
                guests,
                totalPrice: String(totalPrice),
                tourTitle: tour.title,
            },
        });
        
        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error('Checkout error:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: `An error occurred: ${error.message}` }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred during checkout.' }, { status: 500 });
    }
}
