
'use server';

import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import Category from '@/models/Category';
import User from '@/models/User';
import { Types } from 'mongoose';

// To ensure models are registered before use
Category;
User;

export async function getPublishedBlogPosts() {
    await dbConnect();
    try {
        const posts = await Blog.find({ published: true })
            .populate('author', 'name')
            .populate('category', 'name')
            .sort({ publishedAt: -1 })
            .lean();

        // The .lean() method returns plain JavaScript objects, which is faster and
        // avoids potential serialization issues with Next.js Server Components.
        return JSON.parse(JSON.stringify(posts));

    } catch (error) {
        console.error('Error fetching published blog posts:', error);
        return [];
    }
}

export async function getPublishedBlogPostById(id: string) {
    await dbConnect();
    try {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        const blogPost = await Blog.findOne({ _id: id, published: true })
            .populate('author', 'name profilePhoto')
            .populate('category', 'name')
            .lean();

        if (!blogPost) {
            return null;
        }
        
        return JSON.parse(JSON.stringify(blogPost));

    } catch (error) {
        console.error(`Error fetching blog post ${id}:`, error);
        return null;
    }
}
