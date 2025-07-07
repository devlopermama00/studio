
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import { Server as IOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

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

const SocketHandler = (_: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new IOServer(res.socket.server, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: { origin: "*", methods: ["GET", "POST"] }
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on("join", (room) => {
        console.log(`Socket ${socket.id} joining room ${room}`);
        socket.join(room);
      });

       socket.on("leave", (room) => {
        console.log(`Socket ${socket.id} leaving room ${room}`);
        socket.leave(room);
      });

      // Broadcast to all clients in the room including the sender.
      // The client-side logic will prevent duplicates for the sender.
      socket.on("sendMessage", (message) => {
        io.to(message.conversationId).emit("receiveMessage", message);
      });

      // Broadcast to all clients in the room including the sender.
      socket.on("messagesSeen", ({ conversationId, userId }) => {
        io.to(conversationId).emit("messagesSeen", { conversationId, userId });
      });

      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }
  res.end();
};

export default SocketHandler;
