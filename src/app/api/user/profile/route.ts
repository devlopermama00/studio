
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { z } from 'zod';

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

async function verifyUser(request: NextRequest): Promise<NextResponse | DecodedToken> {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        return decoded;
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}

// GET handler for a user to fetch their profile
export async function GET(request: NextRequest) {
    const userCheck = await verifyUser(request);
    if (userCheck instanceof NextResponse) return userCheck;

    try {
        await dbConnect();
        const user = await User.findById(userCheck.id).select('-passwordHash');
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(user);
    } catch (error) {
         console.error('Error fetching user profile:', error);
        return NextResponse.json({ message: 'An error occurred while fetching user profile.' }, { status: 500 });
    }
}

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").optional(),
  bio: z.string().max(300, "Bio cannot be longer than 300 characters.").optional().nullable(),
  profilePhoto: z.string().url("Invalid photo URL").optional(),
});


// PATCH handler for a user to update their profile
export async function PATCH(request: NextRequest) {
    const userCheck = await verifyUser(request);
    if (userCheck instanceof NextResponse) return userCheck;

    try {
        await dbConnect();
        
        const body = await request.json();

        const parseResult = updateProfileSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ message: 'Invalid input', errors: parseResult.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const updateData: Partial<z.infer<typeof updateProfileSchema>> = {};

        if (parseResult.data.name !== undefined) updateData.name = parseResult.data.name;
        if (parseResult.data.bio !== undefined) updateData.bio = parseResult.data.bio;
        if (parseResult.data.profilePhoto !== undefined) updateData.profilePhoto = parseResult.data.profilePhoto;


        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: 'No fields to update provided.' }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(userCheck.id, updateData, { new: true });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const userObject = user.toObject();
        delete userObject.passwordHash;

        return NextResponse.json(userObject);

    } catch (error) {
        console.error('Error updating user profile:', error);
         if (error instanceof Error) {
             return NextResponse.json({ message: 'An error occurred.', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
}
