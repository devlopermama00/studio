
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { createCheckoutSession } from '@/services/payment';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

interface DecodedToken {
    id: string;
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const user = payload as DecodedToken;
        
        const { tourId, numberOfGuests, bookingDate } = await request.json();
        
        if (!tourId || !numberOfGuests || !bookingDate) {
            return NextResponse.json({ error: 'Missing required booking information.' }, { status: 400 });
        }

        const result = await createCheckoutSession(
            tourId,
            user.id,
            Number(numberOfGuests),
            new Date(bookingDate)
        );

        if ('error' in result) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ sessionId: result.sessionId });

    } catch (error) {
        console.error('Checkout API error:', error);
        if (error instanceof Error && error.name === 'JWTExpired') {
            return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
        }
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}
