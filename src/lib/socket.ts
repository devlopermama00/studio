
"use client";

import React from 'react';
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// This function initializes the socket connection if it hasn't been already.
const initializeSocket = (): Socket | null => {
  if (typeof window !== 'undefined' && !socket) {
    // This fetch is a common pattern to ensure the server-side part of Socket.IO is initialized
    // before the client tries to connect.
    fetch('/api/socket');

    socket = io(undefined!, {
        path: "/api/socket",
        reconnection: true,
        reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
        console.log("Socket connected:", socket?.id);
    });

    socket.on('disconnect', () => {
        console.log("Socket disconnected");
    });

    socket.on('connect_error', (err) => {
        console.error("Socket connection error:", err.message);
    });
  }
  return socket;
}

export const useSocket = (): Socket | null => {
    // We use a state to trigger re-renders when the socket is initialized.
    const [socketInstance, setSocketInstance] = React.useState<Socket | null>(initializeSocket());

    React.useEffect(() => {
        // The effect ensures that we have one socket instance and it's created on the client.
        if (!socketInstance) {
            const s = initializeSocket();
            setSocketInstance(s);
        }
    }, [socketInstance]);
    
    return socketInstance;
};
