
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Tour from '@/models/Tour';
import User from '@/models/User';
import { Types } from 'mongoose';

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        const { searchParams } = new URL(request.url);
        const providerIdForAdmin = searchParams.get('providerId');

        await dbConnect();

        let query: any = {};
        if (decoded.role === 'admin' && providerIdForAdmin) {
            if (!Types.ObjectId.isValid(providerIdForAdmin)) {
                return NextResponse.json({ message: 'Invalid provider ID' }, { status: 400 });
            }
            query.createdBy = providerIdForAdmin;
        } else if (decoded.role === 'admin') {
            // No providerId specified, admin gets all tours
        } else if (decoded.role === 'provider') {
            query.createdBy = decoded.id;
        } else {
             return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const tours = await Tour.find(query)
            .populate('category', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json(tours);

    } catch (error) {
        console.error('Error fetching tours:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }
        return NextResponse.json({ message: 'An error occurred while fetching tours.' }, { status: 500 });
    }
}


export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

        if (decoded.role !== 'provider' && decoded.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized: Only providers or admins can create tours.' }, { status: 403 });
        }
        
        await dbConnect();
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        // Check if provider is verified
        if (user.role === 'provider' && !user.isVerified) {
            return NextResponse.json({ message: 'Your provider account must be approved by an admin before you can create tours.' }, { status: 403 });
        }
        
        const body = await request.json();
        
        const requiredFields = ['title', 'overview', 'country', 'city', 'place', 'price', 'durationInHours', 'category', 'tourType', 'groupSize', 'languages', 'highlights', 'inclusions', 'exclusions', 'images'];
        for (const field of requiredFields) {
            if (!body[field] || (Array.isArray(body[field]) && body[field].length === 0)) {
                return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
            }
        }

        const newTourData: any = {
            ...body,
            createdBy: new Types.ObjectId(decoded.id),
            approved: decoded.role === 'admin',
        };

        if (!body.discountPrice || parseFloat(body.discountPrice) <= 0) {
            delete newTourData.discountPrice;
            delete newTourData.offerExpiresAt;
        }

        const newTour = new Tour(newTourData);

        await newTour.save();
        
        const populatedTour = await Tour.findById(newTour._id)
            .populate('category', 'name')
            .populate('createdBy', 'name')
            .lean();

        return NextResponse.json(populatedTour, { status: 201 });

    } catch (error) {
        console.error('Error creating tour:', error);
         if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }
        if (error instanceof Error) {
             return NextResponse.json({ message: 'An error occurred while creating the tour.', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
}
