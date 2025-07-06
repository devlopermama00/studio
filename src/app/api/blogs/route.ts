
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import Category from '@/models/Category';
import User from '@/models/User';

// To ensure models are registered
Category;
User;

// GET all published blog posts
export async function GET() {
    try {
        await dbConnect();
        
        const posts = await Blog.find({ published: true })
            .populate('author', 'name')
            .populate('category', 'name')
            .sort({ publishedAt: -1 });

        return NextResponse.json(posts);

    } catch (error) {
        console.error('Error fetching published blog posts:', error);
        return NextResponse.json({ message: 'An error occurred while fetching blog posts.' }, { status: 500 });
    }
}
