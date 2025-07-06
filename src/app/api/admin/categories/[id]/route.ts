
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
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


export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();

        const categoryId = params.id;
        if (!Types.ObjectId.isValid(categoryId)) {
            return NextResponse.json({ message: 'Invalid category ID' }, { status: 400 });
        }
        
        const { name } = await request.json();
        if (!name) {
            return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        }
        
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { name },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return NextResponse.json({ message: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while updating category.', error: errorMessage }, { status: 500 });
    }
}


export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();
        
        const categoryId = params.id;
        if (!Types.ObjectId.isValid(categoryId)) {
            return NextResponse.json({ message: 'Invalid category ID' }, { status: 400 });
        }

        const deletedCategory = await Category.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            return NextResponse.json({ message: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error deleting category:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while deleting category.', error: errorMessage }, { status: 500 });
    }
}
