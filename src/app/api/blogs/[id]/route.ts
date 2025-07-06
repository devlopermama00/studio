
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import Category from '@/models/Category';
import User from '@/models/User';
import { Types } from 'mongoose';

// To ensure models are registered
Category;
User;

// GET a single published blog post
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        
        const blogId = params.id;
        if (!Types.ObjectId.isValid(blogId)) {
            return NextResponse.json({ message: 'Invalid blog post ID' }, { status: 400 });
        }

        const blogPost = await Blog.findOne({ _id: blogId, published: true })
            .populate('author', 'name profilePhoto')
            .populate('category', 'name');

        if (!blogPost) {
            return NextResponse.json({ message: 'Blog post not found or not published' }, { status: 404 });
        }

        return NextResponse.json(blogPost);

    } catch (error) {
        console.error(`Error fetching blog post ${params.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while fetching the blog post.', error: errorMessage }, { status: 500 });
    }
}
