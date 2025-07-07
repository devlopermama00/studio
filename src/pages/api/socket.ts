
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import { Types } from 'mongoose';

// This is a custom type to extend the NextApiResponse to include our socket server instance.
interface SocketServer extends HTTPServer {
  io?: IOServer;
}
interface SocketWithIO extends NetSocket {
  server: SocketServer;
}
interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('New Socket.io server...');
  await dbConnect();
  const io = new IOServer(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
  });
  res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined room ${conversationId}`);
    });

    socket.on('send_message', async ({ conversationId, senderId, content }) => {
      try {
        const newMessage = await Message.create({
          conversationId,
          sender: new Types.ObjectId(senderId),
          content,
          readBy: [new Types.ObjectId(senderId)],
        });

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: newMessage._id,
        });

        const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name email role profilePhoto');

        // Broadcast to all clients in the room, including the sender
        io.to(conversationId).emit('receive_message', populatedMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', 'Failed to send message.');
      }
    });

    socket.on('messages_seen', async ({ conversationId, userId }) => {
      try {
        await Message.updateMany(
          { conversationId: new Types.ObjectId(conversationId), readBy: { $ne: new Types.ObjectId(userId) } },
          { $addToSet: { readBy: new Types.ObjectId(userId) } }
        );
        
        // Notify others in the room that messages have been seen by this user
        io.to(conversationId).emit('update_seen_status', { conversationId, userId });
      } catch (error) {
         console.error('Error marking messages as seen:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });

  res.end();
}
