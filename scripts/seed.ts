
import dbConnect from '@/lib/db';
import Tour from '@/models/Tour';
import User from '@/models/User';
import Category from '@/models/Category';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

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
    "category_id": "668953185348ba97728c3065",
    "tour_type": "Public",
    "languages": ["English", "Georgian"],
    "highlights": ["Mount Kazbek", "Gergeti Church", "Panoramic Views"],
    "whats_included": ["Transportation", "Guide", "Lunch"],
    "whats_not_included": ["Tips", "Souvenirs"],
    "important_info": "Warm clothing is recommended due to mountain climate.",
    "created_by": "6689528f5348ba97728c305a",
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
    "category_id": "668953185348ba97728c3065",
    "tour_type": "Public",
    "languages": ["English", "Georgian"],
    "highlights": ["Sulphur Baths", "Metekhi Church", "Narikala Fortress"],
    "whats_included": ["Local Guide"],
    "whats_not_included": ["Food", "Tickets"],
    "important_info": "Wear comfortable walking shoes.",
    "created_by": "6689528f5348ba97728c305a",
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
    "category_id": "668953185348ba97728c3065",
    "tour_type": "Public",
    "languages": ["English", "Georgian"],
    "highlights": ["Sighnaghi", "Wine Tastings", "Alaverdi Monastery"],
    "whats_included": ["Transportation", "Guide", "Wine Tastings"],
    "whats_not_included": ["Lunch"],
    "important_info": "Must be 18+ for wine tastings.",
    "created_by": "6689528f5348ba97728c305a",
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

        console.log('Deleting existing tours...');
        await Tour.deleteMany({});
        console.log('Existing tours deleted.');

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
            category: new mongoose.Types.ObjectId(tour.category_id),
            tourType: (tour.tour_type as string).toLowerCase(),
            languages: tour.languages,
            highlights: tour.highlights,
            inclusions: tour.whats_included,
            exclusions: tour.whats_not_included,
            importantInformation: tour.important_info,
            createdBy: new mongoose.Types.ObjectId(tour.created_by),
            itinerary: tour.itinerary.map(item => ({
                title: item.title,
                description: item.description,
            })),
            approved: true, // Approve tours by default for seeding
            blocked: false,
        }));
        
        console.log('Inserting new tours...');
        await Tour.insertMany(transformedTours);
        console.log('New tours inserted successfully!');

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

seedDatabase();
