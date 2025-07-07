
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import { Types } from 'mongoose';

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const { conversationId, content } = await request.json();
        
        if (!conversationId || !content) {
            return NextResponse.json({ message: 'Missing conversationId or content' }, { status: 400 });
        }

        await dbConnect();
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        const senderId = new Types.ObjectId(decoded.id);

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
        }

        if (!conversation.participants.includes(senderId)) {
            return NextResponse.json({ message: 'User is not a participant in this conversation' }, { status: 403 });
        }

        const newMessage = await Message.create({
            conversationId,
            sender: senderId,
            content,
            readBy: [senderId] // The sender has "read" their own message
        });
        
        conversation.lastMessage = newMessage._id;
        await conversation.save();

        const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name email role profilePhoto');

        return NextResponse.json(populatedMessage, { status: 201 });

    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ message: 'An error occurred while sending the message.' }, { status: 500 });
    }
}
