
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Tour from '@/models/Tour';

export async function GET() {
    try {
        await dbConnect();

        const tours = await Tour.find({ approved: true })
            .populate('category', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        const formattedTours = tours.map(tour => ({
            id: tour._id.toString(),
            title: tour.title,
            location: tour.location,
            category: tour.category?.name || 'Uncategorized',
            price: tour.price,
            duration: tour.duration,
            description: tour.description,
            itinerary: [], // Mock data
            images: tour.images,
            providerId: tour.createdBy?._id.toString() || '',
            providerName: tour.createdBy?.name || 'Unknown Provider',
            rating: 4.5, // Mock data
            reviews: [], // Mock data
            approved: tour.approved,
        }));

        return NextResponse.json(formattedTours);

    } catch (error) {
        console.error('Error fetching public tours:', error);
        return NextResponse.json({ message: 'An error occurred while fetching tours.' }, { status: 500 });
    }
}
