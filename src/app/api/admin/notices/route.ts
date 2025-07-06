
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Notice from '@/models/Notice';
import User from '@/models/User';

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

async function verifyAdmin(request: NextRequest): Promise<NextResponse | DecodedToken> {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        if (decoded.role !== 'admin') return NextResponse.json({ message: 'Unauthorized: Admins only' }, { status: 403 });
        return decoded;
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}

// GET all notices for admin
export async function GET(request: NextRequest) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;
    
    try {
        await dbConnect();
        const notices = await Notice.find({})
            .populate('author', 'name')
            .sort({ createdAt: -1 });
        return NextResponse.json(notices);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching notices.' }, { status: 500 });
    }
}

// POST a new notice
export async function POST(request: NextRequest) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();
        const body = await request.json();
        const { title, content, target } = body;

        if (!title || !content || !target) {
            return NextResponse.json({ message: 'Title, content, and target are required' }, { status: 400 });
        }

        const newNotice = new Notice({
            title,
            content,
            target,
            author: adminCheck.id,
        });

        await newNotice.save();
        return NextResponse.json(newNotice, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while creating the notice.', error: errorMessage }, { status: 500 });
    }
}
