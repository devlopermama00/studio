
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

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const adminCheck = await verifyAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        await dbConnect();

        const documentId = params.id;
        if (!Types.ObjectId.isValid(documentId)) {
            return NextResponse.json({ message: 'Invalid document ID' }, { status: 400 });
        }
        
        const body = await request.json();
        const { status } = body;
        
        if (!status || !['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status provided' }, { status: 400 });
        }
        
        const docToUpdate = await Document.findById(documentId);
        if (!docToUpdate) {
            return NextResponse.json({ message: 'Document not found' }, { status: 404 });
        }

        docToUpdate.status = status;
        await docToUpdate.save();

        if (status === 'approved') {
            await User.findByIdAndUpdate(docToUpdate.userId, { isVerified: true });
        } else {
             await User.findByIdAndUpdate(docToUpdate.userId, { isVerified: false });
        }

        const updatedDoc = await Document.findById(documentId).populate('userId', 'name email profilePhoto');

        return NextResponse.json(updatedDoc);
    } catch (error) {
        console.error('Error updating document:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: 'An error occurred while updating the document.', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
}
