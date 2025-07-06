
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Tour from '@/models/Tour';
import Booking from '@/models/Booking';
import Review from '@/models/Review';
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
        if (decoded.role !== 'provider' && decoded.role !== 'admin') {
             return NextResponse.json({ message: 'Unauthorized: Providers or Admins only' }, { status: 403 });
        }
        return decoded;
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}

export async function GET(request: NextRequest) {
    const providerCheck = await verifyProvider(request);
    if (providerCheck instanceof NextResponse) return providerCheck;

    const { searchParams } = new URL(request.url);
    const providerIdFromQuery = searchParams.get('providerId');

    let targetProviderId: Types.ObjectId;

    if (providerCheck.role === 'admin') {
        if (!providerIdFromQuery || !Types.ObjectId.isValid(providerIdFromQuery)) {
            return NextResponse.json({ message: 'Admin must provide a valid providerId' }, { status: 400 });
        }
        targetProviderId = new Types.ObjectId(providerIdFromQuery);
    } else { // Role is 'provider'
        targetProviderId = new Types.ObjectId(providerCheck.id);
    }

    try {
        await dbConnect();

        const providerTours = await Tour.find({ createdBy: targetProviderId }).select('_id');
        const providerTourIds = providerTours.map(t => t._id);

        if (providerTourIds.length === 0) {
            return NextResponse.json({
                totalRevenue: 0,
                totalBookings: 0,
                activeTours: 0,
                averageRating: 0,
                reviewCount: 0,
                monthlyEarnings: [],
                topTours: [],
            });
        }
        
        const totalRevenuePromise = Booking.aggregate([
            { $match: { tourId: { $in: providerTourIds }, status: { $in: ['confirmed', 'completed'] } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        
        const totalBookingsPromise = Booking.countDocuments({ tourId: { $in: providerTourIds } });
        
        const activeToursPromise = Tour.countDocuments({ createdBy: targetProviderId, approved: true });

        const ratingDataPromise = Review.aggregate([
            { $match: { tourId: { $in: providerTourIds } } },
            { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyEarningsPromise = Booking.aggregate([
            { $match: { tourId: { $in: providerTourIds }, status: { $in: ['confirmed', 'completed'] }, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    total: { $sum: '$totalPrice' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const topToursPromise = Booking.aggregate([
            { $match: { tourId: { $in: providerTourIds } } },
            { $group: { _id: '$tourId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 },
            { $lookup: { from: 'tours', localField: '_id', foreignField: '_id', as: 'tourData' } },
            { $unwind: '$tourData' },
            { $project: { _id: 0, title: '$tourData.title', bookings: '$count' } }
        ]);
        
        const [
            revenueData,
            totalBookings,
            activeTours,
            ratingData,
            monthlyEarningsData,
            topTours
        ] = await Promise.all([
            totalRevenuePromise,
            totalBookingsPromise,
            activeToursPromise,
            ratingDataPromise,
            monthlyEarningsPromise,
            topToursPromise
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
        const averageRating = ratingData.length > 0 ? ratingData[0].avgRating : 0;
        const reviewCount = ratingData.length > 0 ? ratingData[0].count : 0;

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyEarnings = [];
        const monthMap = new Map();
        monthlyEarningsData.forEach(item => {
            monthMap.set(item._id.month, item.total);
        });

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const month = d.getMonth() + 1;
            const monthName = monthNames[d.getMonth()];
            monthlyEarnings.push({
                month: monthName,
                total: monthMap.get(month) || 0,
            });
        }

        return NextResponse.json({
            totalRevenue,
            totalBookings,
            activeTours,
            averageRating,
            reviewCount,
            monthlyEarnings,
            topTours
        });

    } catch (error) {
        console.error('Error fetching provider stats:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while fetching stats.', error: errorMessage }, { status: 500 });
    }
}
