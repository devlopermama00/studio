
"use client";

import { useState, useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, Check, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";


interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "provider" | "admin";
  profilePhoto?: string;
  createdAt: string;
}

interface Message {
  _id: string;
  conversationId: string;
  sender: User;
  content: string;
  readBy: { userId: string, readAt: string }[];
  createdAt: string;
}

interface Conversation {
    _id: string;
    participants: User[];
    lastMessage?: Message | null;
    isNew?: boolean;
    isUnread?: boolean;
    updatedAt: string;
}


const chatFormSchema = z.object({
  message: z.string().min(1, "Message cannot be empty."),
});

type ChatFormValues = z.infer<typeof chatFormSchema>;

const ChatMessage = ({ msg, user, otherParticipant }: { msg: Message, user: User, otherParticipant: User }) => {
    const isSender = msg.sender._id === user._id;
    const isRead = msg.readBy.some(r => r.userId === otherParticipant._id);

    return (
        <div className={cn("flex items-end gap-3", isSender ? "justify-end" : "justify-start")}>
            {!isSender && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.sender.profilePhoto} alt={msg.sender.name} />
                    <AvatarFallback>{msg.sender.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
            )}
            <div className={cn(
                "max-w-xs md:max-w-md rounded-lg px-4 py-2 relative",
                isSender
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
            )}>
                <p className="text-sm break-words">{msg.content}</p>
                {isSender && (
                    <div className="flex items-center justify-end mt-1 -mb-1 -mr-2">
                        {isRead ? (
                            <CheckCircle className="h-3.5 w-3.5 text-blue-300" />
                        ) : (
                            <Check className="h-3.5 w-3.5 opacity-60" />
                        )}
                    </div>
                )}
            </div>
            {isSender && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePhoto} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
            )}
        </div>
    );
};


const ChatSkeleton = () => (
    <Card className="h-full flex flex-col">
        <CardHeader>
             <Skeleton className="h-7 w-48" />
             <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex-1 p-6 space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-12 w-3/4 ml-auto" />
            </div>
            <div className="p-4 border-t">
                <Skeleton className="h-12 w-full" />
            </div>
        </CardContent>
    </Card>
)

export default function ChatPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isSending, setIsSending] = useState(false);
    
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, conversation]);

    const form = useForm<ChatFormValues>({
        resolver: zodResolver(chatFormSchema),
        defaultValues: { message: "" },
    });
    
    // Fetch initial user and socket connection
    useEffect(() => {
        const fetchUserAndInitSocket = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                     window.location.href = '/login';
                }
            } catch (e) {
                toast({ variant: 'destructive', title: 'Error', description: "Failed to fetch user data."})
            }

            await fetch('/api/socket');
            const newSocket = io();
            setSocket(newSocket);
            setIsLoading(false);
        };
        fetchUserAndInitSocket();

        return () => {
            socket?.disconnect();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Socket listeners for real-time messages
    useEffect(() => {
        if (socket && user) {
            socket.on('connect', () => console.log('Socket connected'));
            
            socket.on('receiveMessage', (newMessage: Message) => {
                if (conversation?._id === newMessage.conversationId) {
                    setMessages((prev) => {
                        if (prev.some(msg => msg._id === newMessage._id)) return prev;
                        return [...prev, newMessage];
                    });
                    // If we are viewing the chat, emit a read event
                    socket.emit('readMessages', { conversationId: newMessage.conversationId, userId: user._id });
                } else {
                    toast({title: "New Message", description: `From ${newMessage.sender.name}`})
                }
            });

             socket.on('messagesRead', ({ conversationId, userId }) => {
                setMessages(prev => prev.map(msg => ({
                    ...msg,
                    readBy: msg.readBy.some(r => r.userId === userId) ? msg.readBy : [...msg.readBy, { userId, readAt: new Date().toISOString() }],
                })));
            });
        }

        return () => {
             socket?.off('receiveMessage');
             socket?.off('messagesRead');
        }
    }, [socket, user, conversation, toast]);

    // Fetch conversations for user/provider
    useEffect(() => {
        const fetchConversations = async () => {
            if (!user || user.role === 'admin') return;
            try {
                const res = await fetch('/api/chat/conversations');
                if (res.ok) {
                    const data = await res.json();
                    setConversation(data[0]);
                }
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Error', description: "Failed to fetch conversations."})
            }
        };
        fetchConversations();
    }, [user, toast]);

    // Fetch messages for selected conversation
    useEffect(() => {
        const fetchMessages = async () => {
            if (conversation && !conversation.isNew && user && socket) {
                socket.emit('join', conversation._id);
                try {
                    const res = await fetch(`/api/chat/messages/${conversation._id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setMessages(data);
                        // Once messages are loaded, notify that they've been read
                        socket.emit('readMessages', { conversationId: conversation._id, userId: user._id });
                    }
                } catch (error) {
                    toast({ variant: 'destructive', title: 'Error', description: "Failed to fetch messages."})
                }
            } else if (conversation?.isNew) {
                setMessages([]);
            }
        };
        fetchMessages();

        return () => {
            if (conversation && !conversation.isNew) {
                socket?.emit('leave', conversation._id);
            }
        }

    }, [conversation, socket, toast, user]);

    const handleSendMessage = async (values: ChatFormValues) => {
        if (!socket || !conversation || !user) return;
        setIsSending(true);

        const optimisticMessage: Message = {
            _id: `optimistic_${Date.now()}_${Math.random()}`,
            conversationId: conversation._id,
            sender: user,
            content: values.message,
            readBy: [],
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMessage]);
        form.reset();

        try {
            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: conversation._id,
                    content: values.message,
                }),
            });
            const savedMessage = await response.json();
            if (!response.ok) throw new Error(savedMessage.message);
            
            socket.emit('sendMessage', savedMessage);
            setMessages(prev => prev.map(m => m._id === optimisticMessage._id ? savedMessage : m));
            setConversation(prev => prev ? {...prev, lastMessage: savedMessage} : prev);

        } catch (error) {
             toast({ variant: "destructive", title: "Error", description: "Failed to send message." });
             setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id)); // Revert optimistic update
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading || !user) {
        return <ChatSkeleton />;
    }
    
    if (user.role === 'admin') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Chat Unavailable</CardTitle>
                    <CardDescription>The admin chat interface has been removed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">This feature is for user and provider support channels. As an admin, you can manage users from the Users panel.</p>
                    <Button asChild variant="outline" className="mt-4">
                        <Link href="/dashboard/admin/users">Go to User Management</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const otherParticipant = conversation?.participants.find(p => p._id !== user._id);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare/> Chat with Support</CardTitle>
                <CardDescription>Have a question? Our support team is here to help.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
                {conversation && otherParticipant ? (
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="p-4 border-b flex items-center gap-3 bg-secondary">
                        <Avatar><AvatarImage src={otherParticipant.profilePhoto} alt={otherParticipant.name} /><AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback></Avatar>
                        <h3 className="font-semibold">{otherParticipant.name}</h3>
                    </div>
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        {messages.map((msg) => (
                            <ChatMessage key={msg._id} msg={msg} user={user!} otherParticipant={otherParticipant} />
                        ))}
                        <div ref={bottomRef} />
                    </div>
                    <div className="p-4 border-t">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSendMessage)} className="flex items-center gap-2">
                                <FormField control={form.control} name="message" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input {...field} placeholder="Type a message..." className="flex-1" autoComplete="off" />
                                        </FormControl>
                                    </FormItem>
                                )}/>
                                <Button type="submit" size="icon" disabled={isSending}><Send className="h-4 w-4"/></Button>
                            </form>
                        </Form>
                    </div>
                </div>
                ) : <div className="flex items-center justify-center h-full text-muted-foreground"><p>Loading conversation...</p></div>}
            </CardContent>
        </Card>
    );
}
