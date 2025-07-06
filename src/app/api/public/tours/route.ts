
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Tour from '@/models/Tour';
import Category from '@/models/Category';
import User from '@/models/User';
import Review from '@/models/Review';

export async function GET() {
    try {
        await dbConnect();

        const toursData = await Tour.find({ approved: true })
            .populate('category', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        const formattedTours = await Promise.all(toursData.map(async (tour) => {
            const reviews = await Review.find({ tourId: tour._id });
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

            const categoryName = (tour.category as any)?.name || 'Uncategorized';
            const providerName = (tour.createdBy as any)?.name || 'Unknown Provider';

            return {
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
                reviews: [], // Don't need full reviews on list view
                approved: tour.approved,
                description: tour.description,
                itinerary: [],
            };
        }));

        return NextResponse.json(formattedTours);
    } catch (error) {
        console.error('Error fetching public tours:', error);
        return NextResponse.json({ message: 'Error fetching tours' }, { status: 500 });
    }
}
