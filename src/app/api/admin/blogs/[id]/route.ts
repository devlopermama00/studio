
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { Types } from 'mongoose';

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

// GET a single blog post for editing
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();
        
        const blogId = params.id;
        if (!Types.ObjectId.isValid(blogId)) {
            return NextResponse.json({ message: 'Invalid blog post ID' }, { status: 400 });
        }

        const blogPost = await Blog.findById(blogId);

        if (!blogPost) {
            return NextResponse.json({ message: 'Blog post not found' }, { status: 404 });
        }
        return NextResponse.json(blogPost);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while fetching the blog post.', error: errorMessage }, { status: 500 });
    }
}


// PUT to update a blog post
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();

        const blogId = params.id;
        if (!Types.ObjectId.isValid(blogId)) {
            return NextResponse.json({ message: 'Invalid blog post ID' }, { status: 400 });
        }
        
        const body = await request.json();
        
        const updatedPost = await Blog.findByIdAndUpdate(
            blogId,
            body,
            { new: true, runValidators: true }
        );

        if (!updatedPost) {
            return NextResponse.json({ message: 'Blog post not found during update' }, { status: 404 });
        }

        return NextResponse.json(updatedPost);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while updating the blog post.', error: errorMessage }, { status: 500 });
    }
}


// DELETE a blog post
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();
        
        const blogId = params.id;
        if (!Types.ObjectId.isValid(blogId)) {
            return NextResponse.json({ message: 'Invalid blog post ID' }, { status: 400 });
        }

        const deletedPost = await Blog.findByIdAndDelete(blogId);

        if (!deletedPost) {
            return NextResponse.json({ message: 'Blog post not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Blog post deleted successfully' }, { status: 200 });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while deleting the blog post.', error: errorMessage }, { status: 500 });
    }
}
