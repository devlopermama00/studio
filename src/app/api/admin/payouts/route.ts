
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Tour from '@/models/Tour';
import Booking from '@/models/Booking';
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
            const tours = await Tour.find({ createdBy: provider._id }).select('_id');
            const tourIds = tours.map(t => t._id);

            const unpaidBookings = await Booking.aggregate([
                { $match: { tourId: { $in: tourIds }, status: 'completed', payoutStatus: 'unpaid' } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]);

            const processingBookings = await Booking.aggregate([
                { $match: { tourId: { $in: tourIds }, status: 'completed', payoutStatus: 'processing' } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]);

            const lastPayout = await Booking.findOne({ tourId: { $in: tourIds }, payoutStatus: 'paid' })
                .sort({ paidOutAt: -1 })
                .limit(1);

            const unpaidGross = unpaidBookings.length > 0 ? unpaidBookings[0].total : 0;
            const processingGross = processingBookings.length > 0 ? processingBookings[0].total : 0;
            const commissionRate = 0.25;

            return {
                providerId: provider._id.toString(),
                providerName: provider.name,
                pendingBalance: unpaidGross * (1 - commissionRate),
                processingBalance: processingGross * (1 - commissionRate),
                lastPayoutDate: lastPayout?.paidOutAt || null,
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

        const result = await Booking.updateMany(
            { tourId: { $in: tourIds }, status: 'completed', payoutStatus: 'unpaid' },
            { $set: { payoutStatus: 'processing' } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'No unpaid bookings to process for this provider.' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Payout processing started.', modifiedCount: result.modifiedCount });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while initiating payout.', error: errorMessage }, { status: 500 });
    }
}
