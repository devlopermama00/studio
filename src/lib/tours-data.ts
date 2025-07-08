

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
import { getSettings } from '@/lib/settings-data';


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

// Helper function to execute and format tour aggregation pipelines
async function executeTourPipeline(pipeline: any[]): Promise<PublicTourType[]> {
    const toursFromDb = await Tour.aggregate(pipeline);

    const tours = toursFromDb.map(tour => {
        // Ensure images always have a fallback
        if (!tour.images || tour.images.length === 0) {
            tour.images = ["https://placehold.co/800x600.png"];
        }
        return {
            ...tour,
            id: tour.id.toString(),
            providerId: tour.providerId?.toString(),
        };
    });

    return JSON.parse(JSON.stringify(tours));
}

// Reusable aggregation stages for tour lookups and projection
const TOUR_LOOKUPS = [
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'tourId', as: 'reviewData' } },
    { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryData' } },
    { $unwind: { path: '$categoryData', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'creatorData' } },
    { $unwind: { path: '$creatorData', preserveNullAndEmptyArrays: true } },
];

const TOUR_PROJECTION = {
    $project: {
        _id: 0,
        id: '$_id',
        title: 1,
        country: 1,
        city: 1,
        place: 1,
        images: { $ifNull: ['$images', []] },
        durationInHours: 1,
        currency: 1,
        tourType: 1,
        groupSize: 1,
        overview: 1,
        languages: 1,
        highlights: 1,
        inclusions: 1,
        exclusions: 1,
        importantInformation: 1,
        itinerary: 1,
        approved: 1,
        providerId: '$creatorData._id',
        providerName: '$creatorData.name',
        category: '$categoryData.name',
        rating: { $ifNull: [{ $round: [{ $avg: '$reviewData.rating' }, 1] }, 0] },
        price: {
            $cond: {
                if: {
                    $and: [
                        { $ne: ["$discountPrice", null] }, { $gt: ['$discountPrice', 0] },
                        { $ne: ["$offerExpiresAt", null] }, { $gt: ['$offerExpiresAt', new Date()] }
                    ]
                },
                then: '$discountPrice',
                else: '$price'
            }
        },
        originalPrice: {
            $cond: {
                if: {
                    $and: [
                        { $ne: ["$discountPrice", null] }, { $gt: ['$discountPrice', 0] },
                        { $ne: ["$offerExpiresAt", null] }, { $gt: ['$offerExpiresAt', new Date()] }
                    ]
                },
                then: '$price',
                else: '$$REMOVE'
            }
        },
        reviews: { $literal: [] } // Placeholder
    }
};


export async function getPublicTours(limit?: number): Promise<PublicTourType[]> {
    await dbConnect();
    try {
        const pipeline: any[] = [
            { $match: { approved: true, blocked: false } },
            { $sort: { createdAt: -1 } },
        ];
        if (limit) pipeline.push({ $limit: limit });
        pipeline.push(...TOUR_LOOKUPS, TOUR_PROJECTION);
        
        return executeTourPipeline(pipeline);
    } catch (error) {
        console.error("Error in getPublicTours:", error);
        return [];
    }
}

export async function getPopularTours(limit?: number): Promise<PublicTourType[]> {
    await dbConnect();
    try {
        const settings = await getSettings();
        const popularTourIds = settings.homepage_popular_tours || [];

        if (popularTourIds.length === 0) {
            return [];
        }

        const objectIds = popularTourIds.map((id: string) => new Types.ObjectId(id));
        
        const pipeline: any[] = [
            { $match: { _id: { $in: objectIds }, approved: true, blocked: false } },
            { $addFields: { __order: { $indexOfArray: [objectIds, "$_id"] } } },
            { $sort: { __order: 1 } },
        ];

        if (limit) {
            pipeline.push({ $limit: limit });
        }

        pipeline.push(...TOUR_LOOKUPS, TOUR_PROJECTION);
        
        return executeTourPipeline(pipeline);

    } catch (error) {
        console.error("Error fetching popular tours:", error);
        return [];
    }
}


export async function getToursOnSale(limit?: number): Promise<PublicTourType[]> {
    await dbConnect();
    try {
        const now = new Date();
        const pipeline: any[] = [
            {
                $match: {
                    approved: true,
                    blocked: false,
                    discountPrice: { $gt: 0 },
                    offerExpiresAt: { $gt: now }
                }
            },
            { $sort: { offerExpiresAt: 1 } },
        ];
        
        if (limit) {
            pipeline.push({ $limit: limit });
        }

        pipeline.push(...TOUR_LOOKUPS, TOUR_PROJECTION);
        
        return executeTourPipeline(pipeline);
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

