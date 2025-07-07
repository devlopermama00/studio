
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

export async function GET(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        const userId = new Types.ObjectId(decoded.id);

        let conversations;

        if (decoded.role === 'admin') {
            conversations = await Conversation.find()
                .populate('participants', 'name email role profilePhoto')
                .populate({
                    path: 'lastMessage',
                    model: Message,
                    populate: {
                        path: 'sender',
                        model: User,
                        select: 'name'
                    }
                })
                .sort({ 'lastMessage.createdAt': -1, 'updatedAt': -1 });
        } else {
            const adminUser = await User.findOne({ role: 'admin' });
            if (!adminUser) {
                return NextResponse.json({ message: 'Admin user not found, cannot create conversation.' }, { status: 500 });
            }

            let conversation = await Conversation.findOne({
                participants: { $all: [userId, adminUser._id] }
            });

            if (!conversation) {
                conversation = await Conversation.create({
                    participants: [userId, adminUser._id]
                });
            }
            
            conversations = await Conversation.find({ participants: userId })
                .populate('participants', 'name email role profilePhoto')
                .populate({
                    path: 'lastMessage',
                    model: Message,
                    populate: {
                        path: 'sender',
                        model: User,
                        select: 'name'
                    }
                })
                .sort({ 'updatedAt': -1 });
        }

        return NextResponse.json(conversations);

    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ message: 'An error occurred while fetching conversations.' }, { status: 500 });
    }
}
