
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Notice from '@/models/Notice';
import { Types } from 'mongoose';

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

// DELETE a notice
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();
        const noticeId = params.id;
        if (!Types.ObjectId.isValid(noticeId)) {
            return NextResponse.json({ message: 'Invalid notice ID' }, { status: 400 });
        }

        const deletedNotice = await Notice.findByIdAndDelete(noticeId);

        if (!deletedNotice) {
            return NextResponse.json({ message: 'Notice not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Notice deleted successfully' }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: 'An error occurred while deleting the notice.', error: errorMessage }, { status: 500 });
    }
}
