
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { io, type Socket } from "socket.io-client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Send, Check, CheckCheck, Loader2 } from "lucide-react";

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
  readBy: string[];
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: User[];
  lastMessage: Message | null;
  updatedAt: string;
}

// Socket instance variable
let socket: Socket;

const UserChatSkeleton = () => (
    <Card className="h-full">
        <CardContent className="h-full p-0">
            <div className="flex flex-col h-full">
                <div className="p-4 border-b flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
                <div className="flex-1 p-6"></div>
                <div className="p-4 border-t"><Skeleton className="h-10 w-full" /></div>
            </div>
        </CardContent>
    </Card>
);

interface UserChatProps {
    authUser: User;
}

export default function UserChat({ authUser }: UserChatProps) {
    const authUserRef = useRef(authUser);
    useEffect(() => {
        authUserRef.current = authUser;
    }, [authUser]);

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const conversationRef = useRef<Conversation | null>(null);

    useEffect(() => {
        conversationRef.current = conversation;
    }, [conversation]);

    const form = useForm({ defaultValues: { message: "" } });

    // Socket Initializer
    const socketInitializer = async () => {
        await fetch('/api/socket');
        socket = io(undefined!, {
            path: '/api/socket',
        });
        
        socket.on('connect', () => {
            console.log('Connected to socket server');
            if (conversationRef.current) {
                socket.emit('join_conversation', conversationRef.current._id);
            }
        });

        socket.on('receive_message', (newMessage: Message) => {
            const currentConvo = conversationRef.current;
            if (currentConvo && newMessage.conversationId === currentConvo._id) {
                if (newMessage.sender._id === authUserRef.current._id) {
                    setMessages(prev => prev.map(msg => msg._id.startsWith('temp_') ? newMessage : msg));
                } else {
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                    socket.emit('messages_seen', { conversationId: newMessage.conversationId, userId: authUserRef.current._id });
                }
            }
        });
        
        socket.on('update_seen_status', ({ conversationId, userId }) => {
            const currentConvo = conversationRef.current;
            if (currentConvo && conversationId === currentConvo._id) {
                 setMessages((prevMessages) => prevMessages.map(msg => ({
                     ...msg,
                     readBy: [...new Set([...msg.readBy, userId])]
                 })));
            }
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });
    };

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const convosRes = await fetch('/api/chat/conversations');
                if (!convosRes.ok) throw new Error("Failed to fetch conversations");
                const convosData: Conversation[] = await convosRes.json();
                
                if (convosData.length > 0) {
                    const mainConvo = convosData[0];
                    setConversation(mainConvo);

                    const messagesRes = await fetch(`/api/chat/messages/${mainConvo._id}`);
                    if (!messagesRes.ok) throw new Error("Failed to fetch messages");
                    const messagesData = await messagesRes.json();
                    setMessages(messagesData);
                    
                    if (socket) {
                        socket.emit('join_conversation', mainConvo._id);
                        socket.emit('messages_seen', { conversationId: mainConvo._id, userId: authUser._id });
                    }
                }
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Could not load chat." });
            } finally {
                setIsLoading(false);
            }
        };
        socketInitializer();
        fetchInitialData();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (data: { message: string }) => {
        if (!conversation || !data.message.trim() || !socket) return;
        
        const tempId = `temp_${Date.now()}`;
        const optimisticMessage: Message = {
            _id: tempId,
            conversationId: conversation._id,
            sender: authUser,
            content: data.message,
            readBy: [authUser._id],
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimisticMessage]);

        socket.emit('send_message', {
            conversationId: conversation._id,
            senderId: authUser._id,
            content: data.message.trim(),
        });

        form.reset();
    };
    
    const renderMessageStatus = (message: Message) => {
        if (!conversation) return null;
        if (message._id.startsWith('temp_')) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
        
        const adminUser = conversation.participants.find(p => p.role === 'admin');
        if (!adminUser) return null;
        
        const isRead = message.readBy.includes(adminUser._id);
        
        if (isRead) return <CheckCheck className="h-4 w-4 text-blue-500" />;
        return <Check className="h-4 w-4 text-muted-foreground" />;
    };

    if (isLoading) return <UserChatSkeleton />;
    if (!conversation) return <p className="p-4">Could not load conversation. Please contact support.</p>;
    
    const admin = conversation.participants.find(p => p.role === 'admin');
    if (!admin) return <p>Admin user not found.</p>;

    return (
        <Card className="h-full">
            <CardContent className="h-full p-0">
                <div className="flex flex-col h-full bg-secondary/50">
                    <div className="p-4 border-b flex items-center gap-3 bg-background shadow-sm flex-shrink-0">
                        <Avatar>
                            <AvatarImage src={admin.profilePhoto} />
                            <AvatarFallback>{admin.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{admin.name}</p>
                            <p className="text-xs text-muted-foreground">Support Team</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 relative">
                      <div className="absolute inset-0 overflow-y-auto p-4 md:p-6 space-y-4">
                          {messages.map(message => (
                              <div key={message._id} className={cn("flex items-end gap-2", message.sender._id === authUser._id ? "justify-end" : "justify-start")}>
                                  {message.sender._id !== authUser._id && (
                                      <Avatar className="h-8 w-8">
                                          <AvatarImage src={message.sender.profilePhoto} />
                                          <AvatarFallback>{message.sender.name.charAt(0).toUpperCase()}</AvatarFallback>
                                      </Avatar>
                                  )}
                                  <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg shadow-sm", message.sender._id === authUser._id ? "bg-primary text-primary-foreground" : "bg-background")}>
                                      <p className="text-sm">{message.content}</p>
                                      <div className={cn("flex items-center gap-1.5 text-xs mt-1", message.sender._id === authUser._id ? "text-primary-foreground/70 justify-end" : "text-muted-foreground justify-start")}>
                                          <span>{format(new Date(message.createdAt), 'p')}</span>
                                          {message.sender._id === authUser._id && renderMessageStatus(message)}
                                      </div>
                                  </div>
                              </div>
                          ))}
                          <div ref={messagesEndRef} />
                      </div>
                    </div>
                    
                    <div className="p-4 border-t bg-background flex-shrink-0">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSendMessage)} className="flex items-center gap-2">
                                <FormField control={form.control} name="message" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input placeholder="Type a message to support..." autoComplete="off" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <Button type="submit" size="icon" disabled={form.formState.isSubmitting}>
                                     {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
