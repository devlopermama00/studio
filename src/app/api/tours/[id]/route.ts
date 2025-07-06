
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Tour from '@/models/Tour';
import { Types } from 'mongoose';

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

// Helper to verify admin role
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


// PATCH - Approve a tour
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();

        const tourId = params.id;
        if (!Types.ObjectId.isValid(tourId)) {
            return NextResponse.json({ message: 'Invalid tour ID' }, { status: 400 });
        }
        
        const body = await request.json();
        const { approved } = body;
        
        if (typeof approved !== 'boolean') {
            return NextResponse.json({ message: 'Invalid approval status provided' }, { status: 400 });
        }
        
        const updatedTour = await Tour.findByIdAndUpdate(
            tourId,
            { approved },
            { new: true, runValidators: true }
        )
        .populate('category', 'name')
        .populate('createdBy', 'name');

        if (!updatedTour) {
            return NextResponse.json({ message: 'Tour not found' }, { status: 404 });
        }

        return NextResponse.json(updatedTour);
    } catch (error) {
        console.error('Error updating tour:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: 'An error occurred while updating the tour.', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
}

// DELETE - Delete a tour
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();
        
        const tourId = params.id;
        if (!Types.ObjectId.isValid(tourId)) {
            return NextResponse.json({ message: 'Invalid tour ID' }, { status: 400 });
        }

        const deletedTour = await Tour.findByIdAndDelete(tourId);

        if (!deletedTour) {
            return NextResponse.json({ message: 'Tour not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Tour deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error deleting tour:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: 'An error occurred while deleting the tour.', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
}
