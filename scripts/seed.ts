
import dotenv from 'dotenv';
// Load environment variables from .env.local BEFORE other imports
dotenv.config({ path: '.env.local' });

import dbConnect from '@/lib/db';
import Tour from '@/models/Tour';
import User from '@/models/User';
import Category from '@/models/Category';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const toursData = [
  {
    "tour_name": "Kazbegi Mountain Adventure",
    "country": "Georgia",
    "city": "Kazbegi",
    "place_area": "Gergeti",
    "overview": "Scenic drive through the Caucasus mountains with a stop at the historic Gergeti Trinity Church.",
    "photos": [
      "https://source.unsplash.com/random/800x600?mountains",
      "https://source.unsplash.com/random/800x600?caucasus",
      "https://source.unsplash.com/random/800x600?adventure"
    ],
    "duration_hours": 8,
    "price": 60,
    "currency": "USD",
    "max_group_size": 10,
    "tour_type": "Public",
    "languages": ["English", "Georgian"],
    "highlights": ["Mount Kazbek", "Gergeti Church", "Panoramic Views"],
    "whats_included": ["Transportation", "Guide", "Lunch"],
    "whats_not_included": ["Tips", "Souvenirs"],
    "important_info": "Warm clothing is recommended due to mountain climate.",
    "itinerary": [
      {
        "title": "Tbilisi Departure",
        "description": "Start from Tbilisi early morning with hotel pickup."
      },
      {
        "title": "Gudauri Viewpoint",
        "description": "Stop for photos at a scenic viewpoint."
      },
      {
        "title": "Gergeti Trinity Church",
        "description": "Explore the iconic church with a professional guide."
      },
      {
        "title": "Lunch in Kazbegi",
        "description": "Enjoy local Georgian cuisine in a cozy restaurant."
      }
    ]
  },
  {
    "tour_name": "Tbilisi Old Town Cultural Walk",
    "country": "Georgia",
    "city": "Tbilisi",
    "place_area": "Old Town",
    "overview": "Walk through the historic streets of Tbilisi discovering landmarks and culture.",
    "photos": [
      "https://source.unsplash.com/random/800x600?tbilisi",
      "https://source.unsplash.com/random/800x600?historic",
      "https://source.unsplash.com/random/800x600?georgia"
    ],
    "duration_hours": 3,
    "price": 25,
    "currency": "USD",
    "max_group_size": 15,
    "tour_type": "Public",
    "languages": ["English", "Georgian"],
    "highlights": ["Sulphur Baths", "Metekhi Church", "Narikala Fortress"],
    "whats_included": ["Local Guide"],
    "whats_not_included": ["Food", "Tickets"],
    "important_info": "Wear comfortable walking shoes.",
    "itinerary": [
      {
        "title": "Liberty Square",
        "description": "Meet the group at the square and get a brief intro to the city’s history."
      },
      {
        "title": "Sulphur Bath District",
        "description": "Visit the famous bath houses and learn about their importance."
      },
      {
        "title": "Narikala Fortress",
        "description": "Climb to the top for panoramic views of the city."
      }
    ]
  },
  {
    "tour_name": "Kakheti Wine Tasting Day",
    "country": "Georgia",
    "city": "Telavi",
    "place_area": "Kakheti",
    "overview": "Explore Georgia’s wine country with tastings at local wineries and beautiful countryside views.",
    "photos": [
      "https://source.unsplash.com/random/800x600?wine",
      "https://source.unsplash.com/random/800x600?vineyard",
      "https://source.unsplash.com/random/800x600?grapes"
    ],
    "duration_hours": 9,
    "price": 75,
    "currency": "USD",
    "max_group_size": 12,
    "tour_type": "Public",
    "languages": ["English", "Georgian"],
    "highlights": ["Sighnaghi", "Wine Tastings", "Alaverdi Monastery"],
    "whats_included": ["Transportation", "Guide", "Wine Tastings"],
    "whats_not_included": ["Lunch"],
    "important_info": "Must be 18+ for wine tastings.",
    "itinerary": [
      {
        "title": "Telavi Winery Visit",
        "description": "Tour and taste wines from the oldest Georgian winery."
      },
      {
        "title": "Sighnaghi Town Walk",
        "description": "Explore the beautiful town known as 'City of Love'."
      },
      {
        "title": "Wine Cellar Stop",
        "description": "Visit a family-owned cellar for a more intimate tasting."
      }
    ]
  }
];

const seedDatabase = async () => {
    try {
        await dbConnect();
        console.log('Connected to database.');
        
        // Seed admin user
        const adminEmail = 'saurabhcsbs@gmail.com';
        const plainPassword = 'Saurabh@123';
        const hashedPassword = await bcryptjs.hash(plainPassword, 10);

        const adminUser = await User.findOneAndUpdate(
            { email: adminEmail.toLowerCase() },
            {
                $set: {
                    name: 'Admin',
                    username: adminEmail.toLowerCase(),
                    email: adminEmail.toLowerCase(),
                    passwordHash: hashedPassword,
                    role: 'admin',
                    isVerified: true,
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        if(adminUser) {
            console.log('Admin user created or updated successfully!');
        } else {
            console.log('Something went wrong with admin user setup.');
        }


        // Seed a default provider user
        const providerEmail = 'provider@daytourguides.com';
        let providerUser = await User.findOne({ email: providerEmail });
        if (!providerUser) {
            console.log('Default provider user not found, creating one...');
            const hashedPassword = await bcryptjs.hash('Provider@123', 10);
            providerUser = await User.create({
                name: 'Default Provider',
                username: providerEmail,
                email: providerEmail,
                passwordHash: hashedPassword,
                role: 'provider',
                isVerified: true, 
            });
            console.log('Default provider user created successfully!');
        } else {
            console.log('Default provider user already exists.');
        }

        // Seed default categories
        const categoriesToSeed = [
            { name: "City Tours" },
            { name: "Mountain & Hiking" },
            { name: "Wine & Gastronomy" },
            { name: "Historical & Cultural" },
            { name: "Multi-Day Tours" },
            { name: "Adventure & Extreme" },
        ];

        for (const cat of categoriesToSeed) {
            const categoryExists = await Category.findOne({ name: cat.name });
            if (!categoryExists) {
                await Category.create(cat);
                console.log(`Category "${cat.name}" seeded.`);
            }
        }
        
        const defaultCategory = await Category.findOne({ name: 'City Tours' });

        const tourCount = await Tour.countDocuments();
        if (tourCount > 0) {
            console.log('Tours collection is not empty. Skipping seeding.');
        } else {
            console.log('Seeding tours...');
            const transformedTours = toursData.map(tour => ({
                title: tour.tour_name,
                country: tour.country,
                city: tour.city,
                place: tour.place_area,
                overview: tour.overview,
                images: tour.photos,
                durationInHours: tour.duration_hours,
                price: tour.price,
                currency: tour.currency,
                groupSize: tour.max_group_size,
                category: defaultCategory?._id,
                tourType: (tour.tour_type as string).toLowerCase(),
                languages: tour.languages,
                highlights: tour.highlights,
                inclusions: tour.whats_included,
                exclusions: tour.whats_not_included,
                importantInformation: tour.important_info,
                createdBy: providerUser._id,
                itinerary: tour.itinerary.map(item => ({
                    title: item.title,
                    description: item.description,
                })),
                approved: true, // Approve tours by default for seeding
                blocked: false,
            }));
            
            await Tour.insertMany(transformedTours);
            console.log('Tours seeded successfully!');
        }

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

seedDatabase();
