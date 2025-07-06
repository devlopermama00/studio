
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { z } from 'zod';
import { Types } from 'mongoose';

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

async function verifyAccess(request: NextRequest): Promise<NextResponse | DecodedToken> {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        // Allow provider or admin
        if (decoded.role !== 'provider' && decoded.role !== 'admin') {
             return NextResponse.json({ message: 'Unauthorized: Providers or Admins only' }, { status: 403 });
        }
        return decoded;
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}

// GET handler for a provider/admin to fetch payout settings
export async function GET(request: NextRequest) {
    const accessCheck = await verifyAccess(request);
    if (accessCheck instanceof NextResponse) return accessCheck;

    const { searchParams } = new URL(request.url);
    const providerIdFromQuery = searchParams.get('providerId');
    let targetProviderId: string;

    if (accessCheck.role === 'admin') {
        if (!providerIdFromQuery || !Types.ObjectId.isValid(providerIdFromQuery)) {
            return NextResponse.json({ message: 'Admin must provide a valid providerId' }, { status: 400 });
        }
        targetProviderId = providerIdFromQuery;
    } else { // Role is 'provider'
        targetProviderId = accessCheck.id;
    }

    try {
        await dbConnect();
        const user = await User.findById(targetProviderId).select('payoutDetails');
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(user.payoutDetails || {});
    } catch (error) {
         console.error('Error fetching payout settings:', error);
        return NextResponse.json({ message: 'An error occurred while fetching your settings.' }, { status: 500 });
    }
}

const updateSettingsSchema = z.object({
  paypalEmail: z.string().email().optional().or(z.literal('')),
  bankDetails: z.object({
    accountHolderName: z.string().optional(),
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    iban: z.string().optional(),
    swiftCode: z.string().optional(),
  }).optional(),
});

// PATCH handler for a provider to update their payout settings
export async function PATCH(request: NextRequest) {
    const accessCheck = await verifyAccess(request);
    if (accessCheck instanceof NextResponse) return accessCheck;
    
    // Only the provider themselves can update, not an admin
    if (accessCheck.role !== 'provider') {
        return NextResponse.json({ message: 'Unauthorized: Only providers can update their own settings.' }, { status: 403 });
    }

    try {
        await dbConnect();
        const body = await request.json();

        const parseResult = updateSettingsSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ message: 'Invalid input', errors: parseResult.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const updateData = {
            payoutDetails: parseResult.data
        };

        const user = await User.findByIdAndUpdate(accessCheck.id, updateData, { new: true });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const userObject = user.toObject();
        delete userObject.passwordHash;

        return NextResponse.json(userObject.payoutDetails);

    } catch (error) {
        console.error('Error updating payout settings:', error);
         if (error instanceof Error) {
             return NextResponse.json({ message: 'An error occurred.', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
}
