
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

        let responseData;

        if (decoded.role === 'admin') {
            const adminId = userId;
            const adminUser = await User.findById(adminId).lean();
            if (!adminUser) {
                return NextResponse.json({ message: 'Admin user not found' }, { status: 404 });
            }

            const allUsers = await User.find({ _id: { $ne: adminId } }).lean();
            const adminConversations = await Conversation.find({ participants: adminId })
                .populate('participants', 'name email role profilePhoto createdAt')
                .populate({
                    path: 'lastMessage',
                    model: Message,
                    populate: {
                        path: 'sender',
                        model: User,
                        select: 'name'
                    }
                })
                .lean();

            const conversationsMap = new Map<string, any>();
            adminConversations.forEach(convo => {
                const otherParticipant = convo.participants.find((p: any) => p._id.toString() !== adminId.toString());
                if (otherParticipant) {
                    conversationsMap.set(otherParticipant._id.toString(), convo);
                }
            });

            const allDisplayableItems = allUsers.map(user => {
                const existingConvo = conversationsMap.get(user._id.toString());
                if (existingConvo) {
                    const lastMsg = existingConvo.lastMessage;
                    const isUnread = lastMsg &&
                                     lastMsg.sender?._id.toString() !== adminId.toString() &&
                                     !lastMsg.readBy.some((id: Types.ObjectId) => id.equals(adminId));

                    return { ...existingConvo, isUnread };
                } else {
                    return {
                        _id: `new_${user._id.toString()}`,
                        isNew: true,
                        participants: [adminUser, user],
                        lastMessage: null,
                        updatedAt: user.createdAt,
                        isUnread: false,
                    };
                }
            });
            
            allDisplayableItems.sort((a, b) => {
                const aTime = new Date(a.lastMessage?.createdAt || a.updatedAt).getTime();
                const bTime = new Date(b.lastMessage?.createdAt || b.updatedAt).getTime();
                return bTime - aTime;
            });
            
            responseData = allDisplayableItems;

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
            
            responseData = await Conversation.find({ participants: userId })
                .populate('participants', 'name email role profilePhoto createdAt')
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

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ message: 'An error occurred while fetching conversations.' }, { status: 500 });
    }
}


export async function POST(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        if (decoded.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { recipientId } = await request.json();
        if (!recipientId || !Types.ObjectId.isValid(recipientId)) {
            return NextResponse.json({ message: 'Invalid recipient ID' }, { status: 400 });
        }

        const adminId = new Types.ObjectId(decoded.id);
        const recipientObjectId = new Types.ObjectId(recipientId);
        
        await dbConnect();

        let conversation = await Conversation.findOne({
            participants: { $all: [adminId, recipientObjectId] }
        })
        .populate('participants', 'name email role profilePhoto createdAt');

        if (!conversation) {
            const newConversation = await Conversation.create({
                participants: [adminId, recipientObjectId]
            });
            conversation = await Conversation.findById(newConversation._id)
                .populate('participants', 'name email role profilePhoto createdAt');
        }

        return NextResponse.json(conversation);
    } catch (error) {
        console.error('Error creating/finding conversation:', error);
        return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
    }
}
