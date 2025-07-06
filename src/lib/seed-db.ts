
'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import Category from '@/models/Category';
import Tour from '@/models/Tour';
import Review from '@/models/Review';
import { tours as mockToursData, users as mockUsersData, categories as mockCategoriesData } from '@/lib/mock-data';
import bcryptjs from 'bcryptjs';

export async function seedDatabase() {
  try {
    const connection = await dbConnect();
    if (!connection) {
      console.log('No database connection. Skipping seeding.');
      return;
    }

    const tourCount = await Tour.countDocuments();
    if (tourCount > 0) {
      // console.log('Database has tours, skipping seed.');
      return;
    }

    console.log('No tours found. Starting database seed...');

    // 1. Seed Users idempotently
    console.log('Upserting mock users...');
    const passwordHash = await bcryptjs.hash('Password123', 10);
    for (const mockUser of mockUsersData) {
      const { id, ...userToUpsert } = mockUser;
      await User.findOneAndUpdate(
        { email: userToUpsert.email },
        {
          $setOnInsert: {
            ...userToUpsert,
            passwordHash,
            isVerified: userToUpsert.role === 'provider'
          }
        },
        { upsert: true }
      );
    }
    console.log('Mock users are present.');

    // 2. Seed Categories idempotently
    console.log('Upserting mock categories...');
    for (const mockCategory of mockCategoriesData) {
        const { id, ...categoryToUpsert } = mockCategory;
        await Category.findOneAndUpdate(
            { name: categoryToUpsert.name },
            { $setOnInsert: categoryToUpsert },
            { upsert: true }
        );
    }
    console.log('Mock categories are present.');

    // 3. Prepare maps for relationships
    const seededUsers = await User.find({}).lean();
    const seededCategories = await Category.find({}).lean();
    
    const userEmailToIdMap = new Map(seededUsers.map(u => [u.email, u._id]));
    const categoryNameToIdMap = new Map(seededCategories.map(c => [c.name, c._id]));
    const mockUserIdToDbIdMap = new Map(mockUsersData.map(mu => [mu.id, userEmailToIdMap.get(mu.email)]));

    // 4. Seed Tours and Reviews
    const providerDbId = mockUserIdToDbIdMap.get('user-2');
    if (!providerDbId) throw new Error('Could not find mock provider user in DB after seeding.');

    for (const mockTour of mockToursData) {
        const categoryId = categoryNameToIdMap.get(mockTour.category);
        if (!categoryId) {
            console.warn(`Category not found for tour: ${mockTour.title}`);
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
        
        // Seed associated reviews
        if (mockTour.reviews && mockTour.reviews.length > 0) {
            const reviewsToCreate = mockTour.reviews.map(review => {
                const userDbId = mockUserIdToDbIdMap.get(review.userId);
                if (!userDbId) {
                    console.warn(`User not found for review on tour: ${mockTour.title}`);
                    return null;
                }
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

    console.log('Tours and Reviews seeded.');
    console.log('Database seeding complete.');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
