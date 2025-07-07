
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { Stripe } from 'stripe';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
        }
        await jwtVerify(token, JWT_SECRET);

        const sessionId = params.id;
        if (!sessionId) {
            return NextResponse.json({ message: 'Session ID is required.' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ message: 'Payment not completed for this session.' }, { status: 402 });
        }
        
        return NextResponse.json({
            metadata: session.metadata,
            customer_email: session.customer_email,
        });

    } catch (error) {
        console.error('Verify session error:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: `An error occurred: ${error.message}` }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
}
