
import { NextResponse } from 'next/server';
import { handleStripeWebhook } from '@/services/payment';

export async function POST(req: Request) {
  try {
    return await handleStripeWebhook(req);
  } catch (error) {
    console.error('Error in Stripe webhook handler route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(`Webhook handler failed: ${errorMessage}`, { status: 500 });
  }
}
