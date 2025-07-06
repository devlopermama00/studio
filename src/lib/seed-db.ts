
'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import Category from '@/models/Category';
import Tour from '@/models/Tour';
import Review from '@/models/Review';
import Booking from '@/models/Booking';
import { tours as mockToursData, users as mockUsersData, categories as mockCategoriesData, bookings as mockBookingsData, reviews as mockReviewsData } from '@/lib/mock-data';
import bcryptjs from 'bcryptjs';
import { Types } from 'mongoose';

export async function seedDatabase() {
  try {
    const connection = await dbConnect();
    if (!connection) {
      console.log('No database connection. Skipping seeding.');
      return;
    }

    console.log('Starting database seed/sync...');

    // 1. Seed Users idempotently and build maps
    const passwordHash = await bcryptjs.hash('Password123', 10);
    const mockUserIdToDbIdMap = new Map<string, Types.ObjectId>();

    for (const mockUser of mockUsersData) {
      const { id, ...userToUpsert } = mockUser;
      const dbUser = await User.findOneAndUpdate(
        { email: userToUpsert.email },
        {
          $setOnInsert: {
            ...userToUpsert,
            passwordHash,
            isVerified: userToUpsert.role === 'provider' || userToUpsert.role === 'admin'
          }
        },
        { upsert: true, new: true, lean: true }
      );
      if (dbUser) {
        mockUserIdToDbIdMap.set(id, dbUser._id);
      }
    }
    console.log('Mock users are present.');
    
    // 2. Seed Categories idempotently
    const categoryNameToIdMap = new Map<string, Types.ObjectId>();
    for (const mockCategory of mockCategoriesData) {
        const { id, ...categoryToUpsert } = mockCategory;
        const dbCategory = await Category.findOneAndUpdate(
            { name: categoryToUpsert.name },
            { $setOnInsert: categoryToUpsert },
            { upsert: true, new: true, lean: true }
        );
        if (dbCategory) {
            categoryNameToIdMap.set(dbCategory.name, dbCategory._id);
        }
    }
    console.log('Mock categories are present.');

    // 3. Seed Tours idempotently and build tour title map
    const providerDbId = mockUserIdToDbIdMap.get('user-2');
    const tourTitleToIdMap = new Map<string, Types.ObjectId>();

    if (!providerDbId) {
      console.warn('Could not find mock provider user in DB. Tours will not be seeded.');
    } else {
        for (const mockTour of mockToursData) {
            const categoryId = categoryNameToIdMap.get(mockTour.category);
            if (!categoryId) {
                console.warn(`Category '${mockTour.category}' not found for tour: ${mockTour.title}`);
                continue;
            }

            const tourData = {
                title: mockTour.title,
                location: mockTour.location,
                price: mockTour.price,
                duration: mockTour.duration,
                description: mockTour.description,
                itinerary: mockTour.itinerary,
                images: mockTour.images,
                approved: mockTour.approved,
                createdBy: providerDbId,
                category: categoryId,
            };

            const dbTour = await Tour.findOneAndUpdate(
                { title: tourData.title },
                { $setOnInsert: tourData },
                { upsert: true, new: true, lean: true }
            );

            if (dbTour) {
                tourTitleToIdMap.set(dbTour.title, dbTour._id);
            }
        }
    }
    console.log('Mock tours are present.');

    // 4. Seed Reviews idempotently
    for (const mockReview of mockReviewsData) {
        const userDbId = mockUserIdToDbIdMap.get(mockReview.userId);
        // Let's find a tour to attach the review to. The first one for simplicity.
        const firstTourId = Array.from(tourTitleToIdMap.values())[0];
        
        if (userDbId && firstTourId) {
             await Review.findOneAndUpdate(
                { userId: userDbId, tourId: firstTourId, comment: mockReview.comment },
                { $setOnInsert: {
                    userId: userDbId,
                    tourId: firstTourId,
                    rating: mockReview.rating,
                    comment: mockReview.comment,
                    createdAt: new Date(mockReview.createdAt),
                }},
                { upsert: true, new: true, lean: true }
            );
        }
    }
    console.log('Mock reviews are present.');


    // 5. Seed Bookings idempotently
    for (const mockBooking of mockBookingsData) {
        const userDbId = mockUserIdToDbIdMap.get(mockBooking.userId);
        const tourDbId = tourTitleToIdMap.get(mockBooking.tourTitle);
        
        if (userDbId && tourDbId) {
            await Booking.findOneAndUpdate(
                { userId: userDbId, tourId: tourDbId },
                { $setOnInsert: {
                    userId: userDbId,
                    tourId: tourDbId,
                    bookingDate: new Date(mockBooking.bookingDate),
                    guests: mockBooking.guests,
                    totalPrice: mockBooking.totalPrice,
                    status: mockBooking.status,
                    stripePaymentId: `mock_${new Types.ObjectId().toString()}`,
                }},
                { upsert: true, new: true, lean: true }
            );
        }
    }
    console.log('Mock bookings are present.');

    console.log('Database seeding/sync complete.');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
