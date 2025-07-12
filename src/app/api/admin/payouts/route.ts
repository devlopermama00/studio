
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Tour from '@/models/Tour';
import { Types } from 'mongoose';

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

async function verifyAdmin(request: NextRequest): Promise<NextResponse | DecodedToken> {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        if (decoded.role !== 'admin') {
             return NextResponse.json({ message: 'Unauthorized: Admins only' }, { status: 403 });
        }
        return decoded;
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}


export async function GET(request: NextRequest) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();

        const providers = await User.find({ role: 'provider' }).select('_id name');
        
        const payoutData = await Promise.all(providers.map(async (provider) => {
            return {
                providerId: provider._id.toString(),
                providerName: provider.name,
                pendingBalance: 0,
                processingBalance: 0,
                lastPayoutDate: null,
            };
        }));
        
        return NextResponse.json(payoutData);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while fetching payout data.', error: errorMessage }, { status: 500 });
    }
}


export async function POST(request: NextRequest) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        const { providerId } = await request.json();
        if (!providerId || !Types.ObjectId.isValid(providerId)) {
            return NextResponse.json({ message: 'Valid Provider ID is required' }, { status: 400 });
        }

        await dbConnect();
        
        const tours = await Tour.find({ createdBy: new Types.ObjectId(providerId) }).select('_id');
        const tourIds = tours.map(t => t._id);
        
        return NextResponse.json({ message: 'Payout processing started.', modifiedCount: 0 });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while initiating payout.', error: errorMessage }, { status: 500 });
    }
}
