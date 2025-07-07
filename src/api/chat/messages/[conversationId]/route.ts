
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import { Types } from 'mongoose';

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

export async function GET(request: NextRequest, { params }: { params: { conversationId: string } }) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { conversationId } = params;
    if (!Types.ObjectId.isValid(conversationId)) {
        return NextResponse.json({ message: 'Invalid conversation ID' }, { status: 400 });
    }

    try {
        await dbConnect();
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
        }
        
        if (!conversation.participants.includes(new Types.ObjectId(decoded.id))) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        
        // Mark messages in this conversation as read by the current user
        await Message.updateMany(
            { conversationId: new Types.ObjectId(conversationId) },
            { $addToSet: { readBy: new Types.ObjectId(decoded.id) } }
        );

        const messages = await Message.find({ conversationId })
            .populate('sender', 'name email role profilePhoto')
            .sort({ createdAt: 1 });

        return NextResponse.json(messages);

    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ message: 'An error occurred while fetching messages.' }, { status: 500 });
    }
}
