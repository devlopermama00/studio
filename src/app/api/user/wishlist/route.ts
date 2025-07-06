
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Tour from '@/models/Tour';
import Category from '@/models/Category';
import { Types } from 'mongoose';

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

async function verifyUser(request: NextRequest): Promise<NextResponse | DecodedToken> {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        return decoded;
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}

// GET user's wishlist
export async function GET(request: NextRequest) {
    const userCheck = await verifyUser(request);
    if (userCheck instanceof NextResponse) return userCheck;
    const userId = userCheck.id;

    try {
        await dbConnect();
        // Ensure Category model is initialized
        Category;
        const user = await User.findById(userId)
            .populate({
                path: 'wishlist',
                model: Tour,
                 populate: {
                    path: 'category',
                    model: 'Category'
                }
            })
            .select('wishlist');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json(user.wishlist);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return NextResponse.json({ message: 'Error fetching wishlist' }, { status: 500 });
    }
}


// POST to add a tour to wishlist
export async function POST(request: NextRequest) {
    const userCheck = await verifyUser(request);
    if (userCheck instanceof NextResponse) return userCheck;
    const userId = userCheck.id;

    try {
        const { tourId } = await request.json();
        if (!tourId || !Types.ObjectId.isValid(tourId)) {
            return NextResponse.json({ message: 'Invalid tour ID' }, { status: 400 });
        }

        await dbConnect();
        await User.findByIdAndUpdate(userId, {
            $addToSet: { wishlist: tourId }
        });

        return NextResponse.json({ message: 'Tour added to wishlist' }, { status: 200 });

    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return NextResponse.json({ message: 'Error adding to wishlist' }, { status: 500 });
    }
}

// DELETE to remove a tour from wishlist
export async function DELETE(request: NextRequest) {
    const userCheck = await verifyUser(request);
    if (userCheck instanceof NextResponse) return userCheck;
    const userId = userCheck.id;

    try {
        const { tourId } = await request.json();
        if (!tourId || !Types.ObjectId.isValid(tourId)) {
            return NextResponse.json({ message: 'Invalid tour ID' }, { status: 400 });
        }

        await dbConnect();
        await User.findByIdAndUpdate(userId, {
            $pull: { wishlist: tourId }
        });

        return NextResponse.json({ message: 'Tour removed from wishlist' }, { status: 200 });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return NextResponse.json({ message: 'Error removing from wishlist' }, { status: 500 });
    }
}
