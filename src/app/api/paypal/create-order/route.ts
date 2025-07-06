import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Tour from '@/models/Tour';
import { getPayPalAccessToken } from '@/lib/paypal';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const base = process.env.NEXT_PUBLIC_PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }
        await jwtVerify(token, JWT_SECRET);

        const { tourId, guests } = await request.json();
        if (!tourId || !guests) {
            return NextResponse.json({ message: 'Missing required booking information' }, { status: 400 });
        }

        await dbConnect();
        const tour = await Tour.findById(tourId);
        if (!tour) {
            return NextResponse.json({ message: 'Tour not found' }, { status: 404 });
        }

        const totalPrice = tour.price * guests;
        
        const accessToken = await getPayPalAccessToken();
        const url = `${base}/v2/checkout/orders`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: tour.currency,
                        value: totalPrice.toFixed(2),
                    },
                }],
            }),
        });
        
        const paypalOrder = await response.json();
        if (!response.ok) {
            console.error('PayPal API Error:', paypalOrder);
            throw new Error(paypalOrder.message || 'Failed to create PayPal order.');
        }

        return NextResponse.json(paypalOrder);

    } catch (error) {
        console.error('PayPal Create Order error:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message }, { status: 500 });
    }
}
