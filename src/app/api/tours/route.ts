
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
        
        await dbConnect();

        let query = {};
        if (decoded.role === 'provider') {
            query = { createdBy: decoded.id };
        } else if (decoded.role !== 'admin') {
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
        
        const body = await request.json();
        const { title, description, location, price, duration, category } = body;

        if (!title || !description || !location || !price || !duration || !category) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const newTour = new Tour({
            ...body,
            createdBy: new Types.ObjectId(decoded.id),
            images: ["https://placehold.co/800x600.png"], 
            approved: decoded.role === 'admin',
            itinerary: [],
        });

        await newTour.save();

        return NextResponse.json(newTour, { status: 201 });

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
