
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
        const user = await User.findById(userId).populate({
            path: 'wishlist',
            model: Tour,
            populate: [
                { path: 'category', model: Category, select: 'name' },
                { path: 'createdBy', model: User, select: 'name profilePhoto' }
            ]
        });

        if (!user || !user.wishlist || user.wishlist.length === 0) {
            return NextResponse.json([]);
        }

        // Filter out any tours that might have been deleted and are now null
        const populatedWishlist: any[] = user.wishlist.filter(Boolean);

        if (populatedWishlist.length === 0) {
            return NextResponse.json([]);
        }

        const tourIds = populatedWishlist.map(t => t._id);

        // Batch fetch ratings for all tours in the wishlist
        const ratings = await Review.aggregate([
            { $match: { tourId: { $in: tourIds } } },
            { $group: { _id: '$tourId', avgRating: { $avg: '$rating' } } }
        ]);

        const ratingsMap = new Map(ratings.map(r => [r._id.toString(), r.avgRating]));

        // Format the tours into the public-facing type, gracefully handling potential errors
        const formattedWishlist = populatedWishlist.map((tourDoc: any) => {
            try {
                const rating = ratingsMap.get(tourDoc._id.toString()) || 0;
                return {
                    id: tourDoc._id.toString(),
                    title: tourDoc.title,
                    location: tourDoc.location,
                    category: tourDoc.category?.name || 'Uncategorized',
                    price: tourDoc.price,
                    duration: tourDoc.duration,
                    description: tourDoc.description,
                    images: tourDoc.images && tourDoc.images.length > 0 ? tourDoc.images : ["https://placehold.co/800x600.png"],
                    providerName: tourDoc.createdBy?.name || 'Unknown Provider',
                    rating: parseFloat(rating.toFixed(1)),
                    itinerary: tourDoc.itinerary || [],
                    providerId: tourDoc.createdBy?._id?.toString() || '',
                    reviews: [],
                    approved: tourDoc.approved,
                };
            } catch (e) {
                console.error(`Error formatting tour with ID ${tourDoc?._id}:`, e);
                return null; // Return null if a tour fails to format
            }
        }).filter(Boolean); // Filter out any tours that failed to format

        return NextResponse.json(formattedWishlist);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return NextResponse.json({ message: 'An error occurred while fetching wishlist.', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
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
            $addToSet: { wishlist: new Types.ObjectId(tourId) }
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
            $pull: { wishlist: new Types.ObjectId(tourId) }
        });

        return NextResponse.json({ message: 'Tour removed from wishlist' }, { status: 200 });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return NextResponse.json({ message: 'Error removing from wishlist' }, { status: 500 });
    }
}
