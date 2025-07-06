
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
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

export async function PATCH(request: NextRequest, { params }: { params: { providerId: string } }) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        const { providerId } = params;
        if (!providerId || !Types.ObjectId.isValid(providerId)) {
            return NextResponse.json({ message: 'Valid Provider ID is required' }, { status: 400 });
        }

        await dbConnect();
        
        const tours = await Tour.find({ createdBy: new Types.ObjectId(providerId) }).select('_id');
        const tourIds = tours.map(t => t._id);

        const result = await Booking.updateMany(
            { tourId: { $in: tourIds }, status: 'completed', payoutStatus: 'processing' },
            { $set: { payoutStatus: 'paid', paidOutAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'No processing payouts to mark as paid for this provider.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Payout marked as paid.', modifiedCount: result.modifiedCount });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while completing payout.', error: errorMessage }, { status: 500 });
    }
}
