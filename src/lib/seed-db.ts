
'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import Category from '@/models/Category';
import Tour from '@/models/Tour';
import Review from '@/models/Review';
import { tours as mockToursData, users as mockUsersData, categories as mockCategoriesData } from '@/lib/mock-data';
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
    const userEmailToIdMap = new Map<string, Types.ObjectId>();
    const mockUserIdToDbIdMap = new Map<string, Types.ObjectId>();

    for (const mockUser of mockUsersData) {
      const { id, ...userToUpsert } = mockUser;
      const dbUser = await User.findOneAndUpdate(
        { email: userToUpsert.email },
        {
          $setOnInsert: {
            ...userToUpsert,
            passwordHash,
            isVerified: userToUpsert.role === 'provider'
          }
        },
        { upsert: true, new: true, lean: true }
      );
      if (dbUser) {
        userEmailToIdMap.set(dbUser.email, dbUser._id);
        mockUserIdToDbIdMap.set(id, dbUser._id);
      }
    }
    console.log('Mock users are present.');
    
    // 2. Seed Categories idempotently
    console.log('Upserting mock categories...');
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
    const providerDbId = userEmailToIdMap.get('maria@example.com');
    if (!providerDbId) {
      throw new Error('Could not find mock provider user in DB. Seeding cannot continue.');
    }
    
    let newToursAdded = 0;
    for (const mockTour of mockToursData) {
        const existingTour = await Tour.findOne({ title: mockTour.title });
        if (existingTour) {
            continue;
        }

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

    if (newToursAdded > 0) {
      console.log(`${newToursAdded} new tours were seeded.`);
    }
    console.log('Database seeding/sync complete.');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
