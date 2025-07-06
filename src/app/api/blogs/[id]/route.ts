
import { NextResponse } from 'next/server';
import { getPublishedBlogPostById } from '@/lib/blog-data';

// GET a single published blog post
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const blogPost = await getPublishedBlogPostById(params.id);

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
