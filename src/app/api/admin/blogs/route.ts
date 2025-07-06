
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

async function verifyAdmin(request: NextRequest): Promise<NextResponse | DecodedToken> {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        if (decoded.role !== 'admin') {
             return NextResponse.json({ message: 'Unauthorized: Admins only' }, { status: 403 });
        }
        return decoded;
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}

// GET all blog posts for the admin panel
export async function GET(request: NextRequest) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;
    
    try {
        await dbConnect();
        const posts = await Blog.find({})
            .populate('author', 'name')
            .populate('category', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return NextResponse.json({ message: 'An error occurred while fetching blog posts.' }, { status: 500 });
    }
}


// POST to create a new blog post
export async function POST(request: NextRequest) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();
        
        const body = await request.json();
        const { title, content } = body;

        if (!title || !content) {
            return NextResponse.json({ message: 'Title and content are required' }, { status: 400 });
        }

        const newPost = new Blog({
            ...body,
            author: adminCheck.id,
            // Use placeholder if no image provided
            featureImage: body.featureImage || 'https://placehold.co/1200x600.png',
            publishedAt: body.published ? new Date() : null,
        });

        await newPost.save();

        return NextResponse.json(newPost, { status: 201 });

    } catch (error) {
        console.error('Error creating blog post:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while creating the post.', error: errorMessage }, { status: 500 });
    }
}
