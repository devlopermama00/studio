
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

const categoriesToSeed = [
    { name: "City Tours" },
    { name: "Mountain & Hiking" },
    { name: "Wine & Gastronomy" },
    { name: "Historical & Cultural" },
    { name: "Multi-Day Tours" },
    { name: "Adventure & Extreme" },
];

const seedCategories = async () => {
    try {
        const count = await Category.countDocuments();
        if (count === 0) {
            await Category.insertMany(categoriesToSeed);
            console.log('Seeded categories');
        }
    } catch (error) {
        console.error("Error seeding categories", error);
    }
};

export async function GET() {
    try {
        await dbConnect();
        await seedCategories();
        const categories = await Category.find({}).sort({ name: 1 });
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ message: 'Error fetching categories' }, { status: 500 });
    }
}
