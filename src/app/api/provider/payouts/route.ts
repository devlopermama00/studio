
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

async function verifyProvider(request: NextRequest): Promise<NextResponse | DecodedToken> {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        if (decoded.role !== 'provider') { // Only providers can access their payout history
             return NextResponse.json({ message: 'Unauthorized: Providers only' }, { status: 403 });
        }
        return decoded;
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}

// GET handler for a provider to fetch their payout history
export async function GET(request: NextRequest) {
    const providerCheck = await verifyProvider(request);
    if (providerCheck instanceof NextResponse) return providerCheck;

    try {
        await dbConnect();
        
        const providerId = new Types.ObjectId(providerCheck.id);

        const tours = await Tour.find({ createdBy: providerId }).select('_id');
        if (tours.length === 0) {
            return NextResponse.json([]); // No tours, so no payouts
        }
        const tourIds = tours.map(t => t._id);

        const commissionRate = 0.25;

        // Fetch all paid bookings and group them by the date they were paid out
        const payouts = await Booking.aggregate([
            { $match: { tourId: { $in: tourIds }, status: 'completed', payoutStatus: 'paid' } },
            {
                $project: { // Project to calculate net amount before grouping
                    paidOutAt: { $dateToString: { format: "%Y-%m-%d", date: "$paidOutAt" } },
                    netAmount: { $multiply: ["$totalPrice", 1 - commissionRate] }
                }
            },
            {
                $group: {
                    _id: '$paidOutAt', // Group by the formatted date string
                    totalPayout: { $sum: '$netAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': -1 } } // Sort by date descending
        ]);

        const formattedPayouts = payouts.map(p => ({
            id: p._id, // The date string
            date: p._id,
            amount: p.totalPayout,
            bookingCount: p.count,
            status: 'Paid',
        }));

        return NextResponse.json(formattedPayouts);

    } catch (error) {
         console.error('Error fetching payout history:', error);
         if (error instanceof Error) {
            return NextResponse.json({ message: 'An error occurred while fetching your payout history.', error: error.message }, { status: 500 });
         }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
}
