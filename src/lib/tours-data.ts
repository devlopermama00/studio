
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

async function transformTour(tourDoc: any): Promise<PublicTourType | null> {
    try {
        const tour = tourDoc.toObject ? tourDoc.toObject() : tourDoc;

        let avgRating = 0;
        const reviewAggregate = await Review.aggregate([
            { $match: { tourId: new Types.ObjectId(tour._id) } },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);

        if (reviewAggregate.length > 0) {
            avgRating = reviewAggregate[0].avgRating;
        }
        
        return {
            id: tour._id.toString(),
            title: tour.title,
            country: tour.country,
            city: tour.city,
            place: tour.place,
            images: tour.images && tour.images.length > 0 ? tour.images : ["https://placehold.co/800x600.png"],
            durationInHours: tour.durationInHours,
            currency: tour.currency,
            price: tour.price,
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
            reviews: [], // Reviews are fetched separately for the detail page
            approved: tour.approved,
        };
    } catch (error) {
        console.error("Failed to transform tour with ID:", tourDoc?._id, error);
        return null; // Return null if transformation fails for a single tour
    }
}


export async function getPublicTours(limit?: number): Promise<PublicTourType[]> {
    const connection = await dbConnect();
    if (!connection) {
        console.log("No DB connection, returning empty array.");
        return [];
    }
    
    try {
        let query = Tour.find({ approved: true, blocked: false })
            .populate('category', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        if (limit) {
            query = query.limit(limit);
        }
        
        const tours = await query.exec();
        const transformedTours = await Promise.all(tours.map(transformTour));
        // Filter out any tours that failed to transform
        return transformedTours.filter((t): t is PublicTourType => t !== null);
    } catch (error) {
        console.error("Error in getPublicTours:", error);
        return [];
    }
}

export async function getPublicTourById(id: string): Promise<PublicTourType | null> {
    const connection = await dbConnect();
    if (!connection) {
        console.log("No DB connection, returning null.");
        return null;
    }
    
    try {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value || '';
        const user = await verifyToken(token);

        const tourDoc = await Tour.findById(id)
            .populate('category', 'name')
            .populate('createdBy', 'name');

        if (!tourDoc) {
            return null;
        }

        // If tour is not approved, only its creator or an admin can see it.
        if (!tourDoc.approved) {
            if (!user || (user.role !== 'admin' && tourDoc.createdBy._id.toString() !== user.id)) {
                return null;
            }
        }
        
        // Blocked tours are hidden from everyone except admins
        if (tourDoc.blocked && user?.role !== 'admin') {
            return null;
        }

        const transformedTour = await transformTour(tourDoc);

        if (!transformedTour) {
            return null;
        }

        const tourReviews = await Review.find({ tourId: tourDoc._id })
            .populate<{ userId: { _id: Types.ObjectId; name: string, profilePhoto?: string } }>('userId', 'name profilePhoto')
            .sort({ createdAt: -1 });
        
        transformedTour.reviews = tourReviews.map((r: any): ReviewType | null => {
            if (!r.userId) return null;
            
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
        
        return transformedTour;
    } catch (error) {
        console.error(`Error in getPublicTourById for id ${id}:`, error);
        return null;
    }
}
