'use server';

import dbConnect from '@/lib/db';
import Tour from '@/models/Tour';
import Category from '@/models/Category';
import Review from '@/models/Review';
import User from '@/models/User';
import { Types } from 'mongoose';
import type { Tour as PublicTourType, Review as ReviewType } from '@/lib/types';
import { tours as mockTours } from '@/lib/mock-data';

// This is needed to ensure the models are registered with Mongoose before use.
Category;
Review;
User;
Tour;

async function transformTour(tourDoc: any): Promise<PublicTourType> {
    const tour = tourDoc.toObject ? tourDoc.toObject() : tourDoc;

    let avgRating = 0;
    const reviewCount = await Review.countDocuments({ tourId: tour._id });
    if (reviewCount > 0) {
        const aggregateResult = await Review.aggregate([
            { $match: { tourId: new Types.ObjectId(tour._id) } },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);
        if (aggregateResult.length > 0) {
            avgRating = aggregateResult[0].avgRating;
        }
    }
    
    return {
        id: tour._id.toString(),
        title: tour.title,
        location: tour.location,
        category: tour.category?.name || 'Uncategorized',
        price: tour.price,
        duration: tour.duration,
        description: tour.description,
        itinerary: tour.itinerary?.map((i: any) => ({ title: i.title, description: i.description })) || [],
        images: tour.images && tour.images.length > 0 ? tour.images : ["https://placehold.co/800x600.png"],
        providerId: tour.createdBy?._id.toString() || '',
        providerName: tour.createdBy?.name || 'Unknown Provider',
        rating: parseFloat(avgRating.toFixed(1)),
        reviews: [], // Reviews are fetched separately for the detail page
        approved: tour.approved,
    };
}


export async function getPublicTours(limit?: number): Promise<PublicTourType[]> {
    const connection = await dbConnect();
    if (!connection) {
        console.log("No DB connection, returning mock tours.");
        const approvedMocks = mockTours.filter(t => t.approved);
        return limit ? approvedMocks.slice(0, limit) : approvedMocks;
    }
    
    try {
        let query = Tour.find({ approved: true })
            .populate('category', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        if (limit) {
            query = query.limit(limit);
        }
        
        const tours = await query.exec();
        return Promise.all(tours.map(transformTour));
    } catch (error) {
        console.error("Error in getPublicTours:", error);
        return [];
    }
}

export async function getPublicTourById(id: string): Promise<PublicTourType | null> {
    const connection = await dbConnect();
    if (!connection) {
        console.log("No DB connection, returning mock tour.");
        const tour = mockTours.find(t => t.id === id && t.approved);
        return tour || null;
    }
    
    try {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        const tourDoc = await Tour.findById(id)
            .where('approved').equals(true)
            .populate('category', 'name')
            .populate('createdBy', 'name');

        if (!tourDoc) {
            return null;
        }

        const transformedTour = await transformTour(tourDoc);

        const tourReviews = await Review.find({ tourId: tourDoc._id })
            .populate<{ userId: { _id: Types.ObjectId; name: string, profilePhoto?: string } }>('userId', 'name profilePhoto')
            .sort({ createdAt: -1 });
        
        transformedTour.reviews = tourReviews.map((r: any): ReviewType => ({
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
        }));
        
        return transformedTour;
    } catch (error) {
        console.error(`Error in getPublicTourById for id ${id}:`, error);
        return null;
    }
}
