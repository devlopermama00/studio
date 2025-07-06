
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';
import User from '@/models/User';
import { Types } from 'mongoose';

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

async function verifyAccess(request: NextRequest): Promise<NextResponse | DecodedToken> {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        if (decoded.role !== 'provider' && decoded.role !== 'admin') {
             return NextResponse.json({ message: 'Unauthorized: Providers or Admins only' }, { status: 403 });
        }
        return decoded;
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}

// GET handler for a provider/admin to fetch their document status
export async function GET(request: NextRequest) {
    const accessCheck = await verifyAccess(request);
    if (accessCheck instanceof NextResponse) return accessCheck;

    const { searchParams } = new URL(request.url);
    const providerIdFromQuery = searchParams.get('providerId');
    let targetProviderId: string;

    if (accessCheck.role === 'admin') {
        if (!providerIdFromQuery || !Types.ObjectId.isValid(providerIdFromQuery)) {
            // This case is for an admin looking at a specific provider.
            // But for a provider looking at their own dashboard, providerId will be null.
            // If an admin is using this endpoint without a providerId, it implies they are checking their own.
            targetProviderId = accessCheck.id
        } else {
             targetProviderId = providerIdFromQuery;
        }
    } else { // Role is 'provider'
        targetProviderId = accessCheck.id;
    }

    try {
        await dbConnect();
        const document = await Document.findOne({ userId: targetProviderId });
        if (!document) {
            return NextResponse.json(null, { status: 200 }); // Return null but 200 OK, as not finding a doc isn't a server error
        }
        return NextResponse.json(document);
    } catch (error) {
         console.error('Error fetching document:', error);
        return NextResponse.json({ message: 'An error occurred while fetching document status.' }, { status: 500 });
    }
}
