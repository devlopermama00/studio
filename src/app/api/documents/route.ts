
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

async function verifyProvider(request: NextRequest): Promise<NextResponse | DecodedToken> {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        if (decoded.role !== 'provider' && decoded.role !== 'admin') {
             return NextResponse.json({ message: 'Unauthorized: Providers only' }, { status: 403 });
        }
        return decoded;
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}

// GET handler for a provider to fetch their document status
export async function GET(request: NextRequest) {
    const providerCheck = await verifyProvider(request);
    if (providerCheck instanceof NextResponse) return providerCheck;

    try {
        await dbConnect();
        const document = await Document.findOne({ userId: providerCheck.id });
        if (!document) {
            return NextResponse.json(null);
        }
        return NextResponse.json(document);
    } catch (error) {
         console.error('Error fetching document:', error);
        return NextResponse.json({ message: 'An error occurred while fetching document status.' }, { status: 500 });
    }
}

// POST handler for a provider to submit their documents for verification
export async function POST(request: NextRequest) {
    const providerCheck = await verifyProvider(request);
    if (providerCheck instanceof NextResponse) return providerCheck;

    try {
        await dbConnect();

        const existingDoc = await Document.findOne({ userId: providerCheck.id });
        if (existingDoc) {
            return NextResponse.json({ message: 'You have already submitted documents for verification.' }, { status: 400 });
        }

        // In a real app, you would handle file uploads here and get URLs
        const placeholderLicenseUrl = "#";
        const placeholderIdUrl = "#";

        const newDocument = new Document({
            userId: new Types.ObjectId(providerCheck.id),
            licenseUrl: placeholderLicenseUrl,
            idProofUrl: placeholderIdUrl,
            status: 'pending'
        });

        await newDocument.save();

        return NextResponse.json(newDocument, { status: 201 });

    } catch (error) {
        console.error('Error submitting document:', error);
         if (error instanceof Error) {
             return NextResponse.json({ message: 'An error occurred.', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
}
