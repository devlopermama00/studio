
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Tour from '@/models/Tour';
import Booking from '@/models/Booking';
import Review from '@/models/Review';
import Document from '@/models/Document';
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

// GET a single user
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();

        const userId = params.id;
        if (!Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }
        
        const user = await User.findById(userId).select('-passwordHash');
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);

    } catch (error) {
        console.error('Error fetching user:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: 'An error occurred while fetching the user.', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
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

        const userId = params.id;
        if (!Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }
        
        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (userToUpdate.role === 'admin') {
            return NextResponse.json({ message: 'Administrators cannot be blocked.' }, { status: 403 });
        }

        const body = await request.json();
        const { isBlocked } = body;
        
        if (typeof isBlocked !== 'boolean') {
            return NextResponse.json({ message: 'Invalid `isBlocked` status provided' }, { status: 400 });
        }
        
        userToUpdate.isBlocked = isBlocked;
        await userToUpdate.save();

        const updatedUser = userToUpdate.toObject();
        delete updatedUser.passwordHash;

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: 'An error occurred while updating the user.', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
}


export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;
    const adminUserId = adminCheck.id;

    try {
        await dbConnect();

        const userIdToDelete = params.id;
        if (!Types.ObjectId.isValid(userIdToDelete)) {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }
        
        if (adminUserId === userIdToDelete) {
            return NextResponse.json({ message: 'Administrators cannot delete their own account.' }, { status: 403 });
        }

        const userToDelete = await User.findById(userIdToDelete);
        if (!userToDelete) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (userToDelete.role === 'admin') {
            return NextResponse.json({ message: 'Administrators cannot be deleted.' }, { status: 403 });
        }

        const userId = new Types.ObjectId(userIdToDelete);

        // If the user is a provider, delete all their tours and associated data first
        if (userToDelete.role === 'provider') {
            const toursToDelete = await Tour.find({ createdBy: userId });
            const tourIdsToDelete = toursToDelete.map(t => t._id);

            // Delete bookings for these tours
            await Booking.deleteMany({ tourId: { $in: tourIdsToDelete } });
            // Delete reviews for these tours
            await Review.deleteMany({ tourId: { $in: tourIdsToDelete } });
            // Delete the tours themselves
            await Tour.deleteMany({ createdBy: userId });
        }

        // Delete bookings made by the user
        await Booking.deleteMany({ userId: userId });
        // Delete reviews written by the user
        await Review.deleteMany({ userId: userId });
        // Delete documents submitted by the user
        await Document.deleteMany({ userId: userId });

        // Finally, delete the user
        await User.findByIdAndDelete(userIdToDelete);


        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error deleting user:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: 'An error occurred while deleting the user.', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
}
