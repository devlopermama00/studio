
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Tour from '@/models/Tour';
import Document from '@/models/Document';
import Booking from '@/models/Booking';

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

        // Total Revenue
        const revenueDataPromise = Booking.aggregate([
            { $match: { status: { $in: ['confirmed', 'completed'] } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        
        // Monthly Revenue for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenueDataPromise = Booking.aggregate([
            { $match: { status: { $in: ['confirmed', 'completed'] }, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    total: { $sum: '$totalPrice' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        
        const [
            totalUsers,
            totalProviders,
            totalTours,
            pendingProviderApprovals,
            pendingTourApprovals,
            revenueData,
            monthlyRevenueData
        ] = await Promise.all([
            totalUsersPromise,
            totalProvidersPromise,
            totalToursPromise,
            pendingProviderApprovalsPromise,
            pendingTourApprovalsPromise,
            revenueDataPromise,
            monthlyRevenueDataPromise
        ]);

        const totalPendingApprovals = pendingProviderApprovals + pendingTourApprovals;
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
        
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyRevenue = [];
        const monthMap = new Map();
        monthlyRevenueData.forEach(item => {
            monthMap.set(item._id.month, item.total);
        });

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const month = d.getMonth() + 1;
            const monthName = monthNames[d.getMonth()];
            monthlyRevenue.push({
                month: monthName,
                revenue: monthMap.get(month) || 0,
            });
        }


        return NextResponse.json({
            totalRevenue,
            totalUsers,
            totalProviders,
            totalTours,
            totalPendingApprovals,
            pendingProviderApprovals,
            pendingTourApprovals,
            monthlyRevenue
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: 'An error occurred while fetching stats.', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
}
