
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Tour from '@/models/Tour';
import { Types } from 'mongoose';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();

        const { id } = params;

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid tour ID' }, { status: 400 });
        }

        const tour = await Tour.findById(id)
            .populate('category', 'name')
            .populate('createdBy', 'name email profilePhoto');

        if (!tour || !tour.approved) {
            return NextResponse.json({ message: 'Tour not found or not available' }, { status: 404 });
        }
        
        // This is mock data for now, as these are not in the DB model yet.
        const mockItinerary = [
            { title: "Stop 1: Scenic Viewpoint", description: "Start the day with breathtaking panoramic views." },
            { title: "Stop 2: Historical Landmark", description: "Explore a site of great historical importance." },
            { title: "Stop 3: Local Lunch", description: "Enjoy an authentic meal at a traditional local restaurant." },
            { title: "Stop 4: Main Attraction", description: "Visit the highlight of the tour and spend ample time exploring." },
        ];

        const mockReviews = [
             {
                id: "review-1",
                userId: "user-1",
                userName: "Alex Johnson",
                userImage: "https://placehold.co/100x100.png",
                rating: 5,
                comment: "Absolutely breathtaking! The guide was incredibly knowledgeable and friendly. A must-do tour!",
                createdAt: "2023-10-15",
            },
            {
                id: "review-2",
                userId: "user-4",
                userName: "Jane Doe",
                userImage: "https://placehold.co/100x100.png",
                rating: 4,
                comment: "A wonderful day out. The scenery was amazing, though the lunch could have been better. Still highly recommend.",
                createdAt: "2023-10-12",
            }
        ];


        const formattedTour = {
            id: tour._id.toString(),
            title: tour.title,
            location: tour.location,
            category: tour.category?.name || 'Uncategorized',
            price: tour.price,
            duration: tour.duration,
            description: tour.description,
            itinerary: mockItinerary,
            images: tour.images,
            providerId: tour.createdBy?._id.toString() || '',
            providerName: tour.createdBy?.name || 'Unknown Provider',
            rating: 4.8, // Mock data
            reviews: mockReviews,
            approved: tour.approved,
        };

        return NextResponse.json(formattedTour);

    } catch (error) {
        console.error(`Error fetching tour ${params.id}:`, error);
        return NextResponse.json({ message: 'An error occurred while fetching the tour.' }, { status: 500 });
    }
}
