
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
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


export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();
        
        const reviewId = params.id;
        if (!Types.ObjectId.isValid(reviewId)) {
            return NextResponse.json({ message: 'Invalid review ID' }, { status: 400 });
        }

        const deletedReview = await Review.findByIdAndDelete(reviewId);

        if (!deletedReview) {
            return NextResponse.json({ message: 'Review not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Review deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error deleting review:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while deleting the review.', error: errorMessage }, { status: 500 });
    }
}
