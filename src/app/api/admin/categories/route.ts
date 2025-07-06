
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

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

export async function POST(request: NextRequest) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();
        
        const { name } = await request.json();
        if (!name) {
            return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        }

        const newCategory = new Category({ name });
        await newCategory.save();

        return NextResponse.json(newCategory, { status: 201 });

    } catch (error) {
        console.error('Error creating category:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while creating category.', error: errorMessage }, { status: 500 });
    }
}
