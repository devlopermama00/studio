
'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import Category from '@/models/Category';
import Tour from '@/models/Tour';
import Review from '@/models/Review';
import Booking from '@/models/Booking';
import { tours as mockToursData, users as mockUsersData, categories as mockCategoriesData, bookings as mockBookingsData } from '@/lib/mock-data';
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

    // 3. Seed Tours and Reviews idempotently
    const providerDbId = mockUserIdToDbIdMap.get('user-2');
    if (!providerDbId) {
      console.warn('Could not find mock provider user in DB. Tours will not be seeded.');
    } else {
        let newToursAdded = 0;
        for (const mockTour of mockToursData) {
            const existingTour = await Tour.findOne({ title: mockTour.title });
            if (existingTour) continue;

            const categoryId = categoryNameToIdMap.get(mockTour.category);
            if (!categoryId) {
                console.warn(`Category '${mockTour.category}' not found for tour: ${mockTour.title}`);
                continue;
            }

            const tourToCreate = {
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

            const newTour = await new Tour(tourToCreate).save();
            newToursAdded++;
            
            if (mockTour.reviews && mockTour.reviews.length > 0) {
                const reviewsToCreate = mockTour.reviews.map(review => {
                    const userDbId = mockUserIdToDbIdMap.get(review.userId);
                    if (!userDbId) return null;
                    return {
                        tourId: newTour._id,
                        userId: userDbId,
                        rating: review.rating,
                        comment: review.comment,
                        createdAt: new Date(review.createdAt),
                    };
                }).filter(Boolean);

                if (reviewsToCreate.length > 0) {
                    await Review.insertMany(reviewsToCreate as any[]);
                }
            }
        }
        if (newToursAdded > 0) console.log(`${newToursAdded} new tours were seeded.`);
    }
    console.log('Mock tours and reviews are present.');

    // 4. Seed Bookings idempotently
    console.log('Upserting mock bookings...');
    const tourTitleToIdMap = new Map<string, Types.ObjectId>();
    const dbTours = await Tour.find({}).lean();
    dbTours.forEach(t => tourTitleToIdMap.set(t.title, t._id));

    let newBookingsAdded = 0;
    for (const mockBooking of mockBookingsData) {
        const userDbId = mockUserIdToDbIdMap.get(mockBooking.userId);
        const tourDbId = tourTitleToIdMap.get(mockBooking.tourTitle);
        
        if (userDbId && tourDbId) {
            const existingBooking = await Booking.findOne({ userId: userDbId, tourId: tourDbId });

            if (!existingBooking) {
                await new Booking({
                    userId: userDbId,
                    tourId: tourDbId,
                    bookingDate: new Date(mockBooking.bookingDate),
                    guests: mockBooking.guests,
                    totalPrice: mockBooking.totalPrice,
                    status: mockBooking.status,
                    stripePaymentId: `mock_${new Types.ObjectId().toString()}`,
                }).save();
                newBookingsAdded++;
            }
        }
    }
    if (newBookingsAdded > 0) console.log(`${newBookingsAdded} new bookings were seeded.`);
    console.log('Mock bookings are present.');

    console.log('Database seeding/sync complete.');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
