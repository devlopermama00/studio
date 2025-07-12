
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Tour from '@/models/Tour';
import Document from '@/models/Document';

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

        const totalUsersPromise = User.countDocuments({});
        const totalProvidersPromise = User.countDocuments({ role: 'provider' });
        const totalToursPromise = Tour.countDocuments({});
        
        const pendingProviderApprovalsPromise = Document.countDocuments({ status: 'pending' });
        const pendingTourApprovalsPromise = Tour.countDocuments({ approved: false });

        
        const [
            totalUsers,
            totalProviders,
            totalTours,
            pendingProviderApprovals,
            pendingTourApprovals,
        ] = await Promise.all([
            totalUsersPromise,
            totalProvidersPromise,
            totalToursPromise,
            pendingProviderApprovalsPromise,
            pendingTourApprovalsPromise,
        ]);

        const totalPendingApprovals = pendingProviderApprovals + pendingTourApprovals;

        return NextResponse.json({
            totalRevenue: 0,
            totalUsers,
            totalProviders,
            totalTours,
            totalBookings: 0,
            totalPendingApprovals,
            pendingProviderApprovals,
            pendingTourApprovals,
            monthlyRevenue: [],
            topTours: [],
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: 'An error occurred while fetching stats.', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
}
