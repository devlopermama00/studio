
'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import Category from '@/models/Category';
import Tour from '@/models/Tour';
import Review from '@/models/Review';
import Booking from '@/models/Booking';
import { tours as mockToursData, users as mockUsersData, categories as mockCategoriesData, reviews as mockReviewsData, bookings as mockBookingsData } from '@/lib/mock-data';
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

    // --- Maps to store mock ID -> DB ID ---
    const mockUserIdToDbIdMap = new Map<string, Types.ObjectId>();
    const categoryNameToIdMap = new Map<string, Types.ObjectId>();
    const tourTitleToIdMap = new Map<string, Types.ObjectId>();

    // 1. Seed Users
    const passwordHash = await bcryptjs.hash('Password123', 10);
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
    console.log('Users seeded.');

    // 2. Seed Categories
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
    console.log('Categories seeded.');

    // 3. Seed Tours
    const providerDbId = mockUserIdToDbIdMap.get('user-2'); // Maria Garcia
    if (!providerDbId) {
      console.error('Seed error: Provider user not found.');
      return;
    }

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
    console.log('Tours seeded.');

    // 4. Seed User Wishlist
    const userForWishlist = mockUserIdToDbIdMap.get('user-1'); // Dan
    const tour1Id = tourTitleToIdMap.get('Kazbegi Mountain Adventure');
    const tour2Id = tourTitleToIdMap.get('Kakheti Wine Region Tour');

    if (userForWishlist && tour1Id && tour2Id) {
      await User.findByIdAndUpdate(userForWishlist, {
        $addToSet: { wishlist: { $each: [tour1Id, tour2Id] } }
      });
      console.log('User wishlist seeded.');
    }

    // 5. Seed Reviews
    const firstTourId = tourTitleToIdMap.get('Old Tbilisi Walking Tour');
    for (const mockReview of mockReviewsData) {
      const userDbId = mockUserIdToDbIdMap.get(mockReview.userId);
      if (userDbId && firstTourId) {
        await Review.findOneAndUpdate(
          { userId: userDbId, tourId: firstTourId, comment: mockReview.comment },
          {
            $setOnInsert: {
              userId: userDbId,
              tourId: firstTourId,
              rating: mockReview.rating,
              comment: mockReview.comment,
              createdAt: new Date(mockReview.createdAt),
            }
          },
          { upsert: true, new: true, lean: true }
        );
      }
    }
    console.log('Reviews seeded.');

    // 6. Seed Bookings
    for (const mockBooking of mockBookingsData) {
      const userDbId = mockUserIdToDbIdMap.get(mockBooking.userId);
      const tourDbId = tourTitleToIdMap.get(mockBooking.tourTitle);
      if (userDbId && tourDbId) {
        await Booking.findOneAndUpdate(
          { userId: userDbId, tourId: tourDbId },
          {
            $setOnInsert: {
              userId: userDbId,
              tourId: tourDbId,
              bookingDate: new Date(mockBooking.bookingDate),
              guests: mockBooking.guests,
              totalPrice: mockBooking.totalPrice,
              status: mockBooking.status,
              stripePaymentId: `mock_${new Types.ObjectId().toString()}`,
            }
          },
          { upsert: true, new: true, lean: true }
        );
      }
    }
    console.log('Bookings seeded.');
    console.log('Database seeding/sync complete.');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
