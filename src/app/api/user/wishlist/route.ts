
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Tour from '@/models/Tour';
import Category from '@/models/Category';
import Review from '@/models/Review';
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
        const user = await User.findById(userId).select('wishlist').lean();

        if (!user || !user.wishlist || user.wishlist.length === 0) {
            return NextResponse.json([]);
        }
        
        const tours = await Tour.find({ '_id': { $in: user.wishlist } })
            .populate('category', 'name')
            .populate('createdBy', 'name')
            .lean();

        if (!tours || tours.length === 0) {
            return NextResponse.json([]);
        }

        const tourIds = tours.map(t => t._id);

        const ratings = await Review.aggregate([
            { $match: { tourId: { $in: tourIds } } },
            { $group: { _id: '$tourId', avgRating: { $avg: '$rating' } } }
        ]);

        const ratingsMap = new Map(ratings.map(r => [r._id.toString(), r.avgRating]));

        const formattedWishlist = tours.map((tour: any) => {
             const rating = ratingsMap.get(tour._id.toString()) || 0;
             return {
                id: tour._id.toString(),
                title: tour.title,
                location: tour.location,
                category: tour.category?.name || 'Uncategorized',
                price: tour.price,
                duration: tour.duration,
                description: tour.description,
                images: tour.images && tour.images.length > 0 ? tour.images : ["https://placehold.co/800x600.png"],
                providerName: tour.createdBy?.name || 'Unknown Provider',
                rating: parseFloat(rating.toFixed(1)),
                itinerary: tour.itinerary || [],
                providerId: tour.createdBy?._id.toString() || '',
                reviews: [],
                approved: tour.approved,
            }
        });

        return NextResponse.json(formattedWishlist);
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
