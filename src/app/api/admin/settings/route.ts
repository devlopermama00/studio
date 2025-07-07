
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Setting from '@/models/Setting';

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

// GET all settings
export async function GET(request: NextRequest) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();
        const settingsArray = await Setting.find({});
        const settingsObject = settingsArray.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {} as { [key: string]: any });
        return NextResponse.json(settingsObject);
    } catch (error) {
        return NextResponse.json({ message: 'An error occurred while fetching settings.' }, { status: 500 });
    }
}


// PATCH to update settings
export async function PATCH(request: NextRequest) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();
        const body = await request.json(); // e.g., { primaryColor: '#...', siteName: '...' }

        const updatePromises = Object.entries(body).map(([key, value]) => {
            return Setting.findOneAndUpdate(
                { key },
                { $set: { value } },
                { upsert: true, new: true } // upsert: create if it doesn't exist
            );
        });

        await Promise.all(updatePromises);
        
        return NextResponse.json({ message: 'Settings updated successfully' });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while updating settings.', error: errorMessage }, { status: 500 });
    }
}
