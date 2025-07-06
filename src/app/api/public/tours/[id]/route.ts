
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Tour from '@/models/Tour';
import Category from '@/models/Category';
import User from '@/models/User';
import Review from '@/models/Review';
import mongoose from 'mongoose';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid tour ID' }, { status: 400 });
        }

        const tour = await Tour.findOne({ _id: id, approved: true })
            .populate('category', 'name')
            .populate('createdBy', 'name');

        if (!tour) {
            return NextResponse.json({ message: 'Tour not found or not approved' }, { status: 404 });
        }

        const reviews = await Review.find({ tourId: tour._id }).populate('userId', 'name profilePhoto').sort({ createdAt: -1 });
        
        const formattedReviews = reviews.map(review => ({
            id: review._id.toString(),
            userId: review.userId._id.toString(),
            userName: (review.userId as any).name,
            userImage: (review.userId as any).profilePhoto || "https://placehold.co/100x100.png",
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt.toISOString().split('T')[0],
        }));

        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

        const categoryName = (tour.category as any)?.name || 'Uncategorized';
        const providerName = (tour.createdBy as any)?.name || 'Unknown Provider';

        const formattedTour = {
            id: tour._id.toString(),
            title: tour.title,
            location: tour.location,
            category: categoryName,
            price: tour.price,
            duration: tour.duration,
            images: tour.images,
            providerId: tour.createdBy.toString(),
            providerName: providerName,
            rating: parseFloat(averageRating.toFixed(1)),
            reviews: formattedReviews,
            approved: tour.approved,
            description: tour.description,
            itinerary: [], // placeholder for itinerary
        };

        return NextResponse.json(formattedTour);
    } catch (error) {
        console.error(`Error fetching tour ${params.id}:`, error);
        return NextResponse.json({ message: 'Error fetching tour' }, { status: 500 });
    }
}
