
'use server';

import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import User from '@/models/User';
import Tour from '@/models/Tour';

// To ensure models are registered
User;
Tour;

export async function getPublicReviews(limit: number = 9) {
    await dbConnect();
    try {
        const reviews = await Review.find({})
            .populate<{ userId: { name: string, profilePhoto?: string } }>('userId', 'name profilePhoto')
            .populate<{ tourId: { title: string } }>('tourId', 'title')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        
        // The .lean() method returns plain JavaScript objects, which is faster and
        // avoids potential serialization issues with Next.js Server Components.
        return JSON.parse(JSON.stringify(reviews));

    } catch (error) {
        console.error('Error fetching public reviews:', error);
        return [];
    }
}
