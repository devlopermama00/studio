
import { NextResponse } from 'next/server';
import { getPublishedBlogPosts } from '@/lib/blog-data';


// GET all published blog posts
export async function GET() {
    try {
        const posts = await getPublishedBlogPosts();
        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching published blog posts:', error);
        return NextResponse.json({ message: 'An error occurred while fetching blog posts.' }, { status: 500 });
    }
}
