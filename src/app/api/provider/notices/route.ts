
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Notice from '@/models/Notice';

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

async function verifyProvider(request: NextRequest): Promise<NextResponse | DecodedToken> {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
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

// GET all notices for providers
export async function GET(request: NextRequest) {
    const providerCheck = await verifyProvider(request);
    if (providerCheck instanceof NextResponse) return providerCheck;
    
    try {
        await dbConnect();
        // Fetch notices targeted to 'provider' or 'all'
        const notices = await Notice.find({ target: { $in: ['provider', 'all'] } })
            .populate('author', 'name')
            .sort({ createdAt: -1 })
            .limit(5); // Let's limit it to the 5 most recent notices for the dashboard
            
        return NextResponse.json(notices);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching notices.' }, { status: 500 });
    }
}
