
'use server';

import dbConnect from '@/lib/db';
import Tour from '@/models/Tour';
import Category from '@/models/Category';
import Review from '@/models/Review';
import User from '@/models/User';
import { Types } from 'mongoose';
import type { Tour as PublicTourType, Review as ReviewType } from '@/lib/types';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// This is needed to ensure the models are registered with Mongoose before use.
Category;
Review;
User;
Tour;

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

async function verifyToken(token: string): Promise<DecodedToken | null> {
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as DecodedToken;
    } catch (error) {
        // It's okay for this to fail silently if the token is invalid or expired
        return null;
    }
}

const transformTours = async (tours: any[]): Promise<PublicTourType[]> => {
    if (!tours || tours.length === 0) {
        return [];
    }

    const tourIds = tours.map(t => t._id);

    const ratings = await Review.aggregate([
        { $match: { tourId: { $in: tourIds } } },
        { $group: { _id: '$tourId', avgRating: { $avg: '$rating' } } }
    ]);

    const ratingsMap = new Map(ratings.map(r => [r._id.toString(), r.avgRating]));
    const now = new Date();

    const transformedTours = tours.map(tour => {
        const rating = ratingsMap.get(tour._id.toString()) || 0;
        const isOfferActive = tour.discountPrice && tour.discountPrice > 0 && tour.offerExpiresAt && new Date(tour.offerExpiresAt) > now;
        
        return {
            id: tour._id.toString(),
            title: tour.title,
            country: tour.country,
            city: tour.city,
            place: tour.place,
            images: tour.images && tour.images.length > 0 ? tour.images : ["https://placehold.co/800x600.png"],
            durationInHours: tour.durationInHours,
            currency: tour.currency,
            price: isOfferActive ? tour.discountPrice : tour.price,
            originalPrice: isOfferActive ? tour.price : undefined,
            tourType: tour.tourType,
            category: tour.category?.name || 'Uncategorized',
            groupSize: tour.groupSize,
            overview: tour.overview,
            languages: tour.languages || [],
            highlights: tour.highlights || [],
            inclusions: tour.inclusions || [],
            exclusions: tour.exclusions || [],
            importantInformation: tour.importantInformation,
            itinerary: tour.itinerary?.map((i: any) => ({ title: i.title, description: i.description })) || [],
            providerId: tour.createdBy?._id?.toString() || '',
            providerName: tour.createdBy?.name || 'Unknown Provider',
            rating: parseFloat(rating.toFixed(1)),
            reviews: [],
            approved: tour.approved,
        };
    });

    return transformedTours.filter((t): t is PublicTourType => t !== null);
};


export async function getPublicTours(limit?: number): Promise<PublicTourType[]> {
    await dbConnect();
    
    try {
        let query = Tour.find({ approved: true, blocked: false })
            .populate('category', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .lean();

        if (limit) {
            query = query.limit(limit);
        }
        
        const tours = await query.exec();
        return transformTours(tours);
    } catch (error) {
        console.error("Error in getPublicTours:", error);
        return [];
    }
}

export async function getToursOnSale(limit?: number): Promise<PublicTourType[]> {
    await dbConnect();
    try {
        const now = new Date();
        let query = Tour.find({
            approved: true,
            blocked: false,
            discountPrice: { $gt: 0 },
            offerExpiresAt: { $gt: now }
        })
        .populate('category', 'name')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .lean();

        if (limit) {
            query = query.limit(limit);
        }

        const tours = await query.exec();
        return transformTours(tours);
    } catch (error) {
        console.error("Error fetching tours on sale:", error);
        return [];
    }
}

export async function getPublicTourById(id: string): Promise<PublicTourType | null> {
    await dbConnect();
    
    try {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value || '';
        const user = await verifyToken(token);

        const tourDoc = await Tour.findById(id)
            .populate('category', 'name')
            .populate('createdBy', 'name')
            .lean();

        if (!tourDoc) {
            return null;
        }

        if (!tourDoc.approved && (!user || (user.role !== 'admin' && tourDoc.createdBy?._id.toString() !== user.id))) {
            return null;
        }
        
        if (tourDoc.blocked && user?.role !== 'admin') {
            return null;
        }

        const tour = tourDoc;
        const now = new Date();

        const reviewAggregate = await Review.aggregate([
            { $match: { tourId: new Types.ObjectId(tour._id) } },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);
        const avgRating = reviewAggregate.length > 0 ? reviewAggregate[0].avgRating : 0;

        const tourReviews = await Review.find({ tourId: tourDoc._id })
            .populate<{ userId: { _id: Types.ObjectId; name: string, profilePhoto?: string } }>('userId', 'name profilePhoto')
            .sort({ createdAt: -1 })
            .lean();
        
        const reviews = tourReviews.map((r: any): ReviewType | null => {
            if (!r.userId || !r.userId.name) return null;
            
            return {
                id: r._id.toString(),
                userId: r.userId._id.toString(),
                userName: r.userId.name,
                userImage: r.userId.profilePhoto || `https://placehold.co/100x100.png`,
                rating: r.rating,
                comment: r.comment,
                createdAt: new Date(r.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }),
            }
        }).filter((r): r is ReviewType => r !== null);
        
        const isOfferActive = tour.discountPrice && tour.discountPrice > 0 && tour.offerExpiresAt && new Date(tour.offerExpiresAt) > now;
        
        return {
            id: tour._id.toString(),
            title: tour.title,
            country: tour.country,
            city: tour.city,
            place: tour.place,
            images: tour.images && tour.images.length > 0 ? tour.images : ["https://placehold.co/800x600.png"],
            durationInHours: tour.durationInHours,
            currency: tour.currency,
            price: isOfferActive ? tour.discountPrice! : tour.price,
            originalPrice: isOfferActive ? tour.price : undefined,
            tourType: tour.tourType,
            category: tour.category?.name || 'Uncategorized',
            groupSize: tour.groupSize,
            overview: tour.overview,
            languages: tour.languages || [],
            highlights: tour.highlights || [],
            inclusions: tour.inclusions || [],
            exclusions: tour.exclusions || [],
            importantInformation: tour.importantInformation,
            itinerary: tour.itinerary?.map((i: any) => ({ title: i.title, description: i.description })) || [],
            providerId: tour.createdBy?._id?.toString() || '',
            providerName: tour.createdBy?.name || 'Unknown Provider',
            rating: parseFloat(avgRating.toFixed(1)),
            reviews: reviews,
            approved: tour.approved,
        };
    } catch (error) {
        console.error(`Error in getPublicTourById for id ${id}:`, error);
        return null;
    }
}
