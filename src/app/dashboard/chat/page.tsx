
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { io, Socket } from "socket.io-client";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Check, CheckCheck, CircleDashed } from "lucide-react";

let socket: Socket;

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
  isNew?: boolean;
  isUnread?: boolean;
}

const ChatPageSkeleton = () => (
    <Card className="h-[calc(100vh-10rem)] w-full">
        <CardContent className="grid md:grid-cols-[300px_1fr] h-full p-0">
            <div className="border-r h-full flex flex-col">
                <div className="p-4 border-b"><Skeleton className="h-10 w-full" /></div>
                <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="w-full space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-col h-full">
                <div className="flex-1 p-6"></div>
                <div className="p-4 border-t"><Skeleton className="h-10 w-full" /></div>
            </div>
        </CardContent>
    </Card>
);


export default function ChatPage() {
    const [authUser, setAuthUser] = useState<User | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const form = useForm({ defaultValues: { message: "" } });

    // Initial data fetching
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const userRes = await fetch('/api/auth/me');
                if (!userRes.ok) throw new Error("Not authenticated");
                const userData = await userRes.json();
                setAuthUser(userData);

                const convosRes = await fetch('/api/chat/conversations');
                if (!convosRes.ok) throw new Error("Failed to fetch conversations");
                const convosData = await convosRes.json();
                setConversations(convosData);
                setFilteredConversations(convosData);

                if (userData.role !== 'admin' && convosData.length > 0) {
                    handleSelectConversation(convosData[0]);
                }
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Could not load chat." });
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [toast]);

    // Socket.IO setup
    useEffect(() => {
        const socketInitializer = async () => {
            await fetch("/api/socket");
            socket = io();

            socket.on("connect", () => console.log("Socket connected"));

            socket.on("receiveMessage", (newMessage: Message) => {
                if (newMessage.conversationId === selectedConversation?._id) {
                    setMessages((prev) => [...prev, newMessage]);
                }
                 setConversations(prev => prev.map(c => c._id === newMessage.conversationId ? {...c, lastMessage: newMessage, isUnread: c._id !== selectedConversation?._id } : c));
                 setFilteredConversations(prev => prev.map(c => c._id === newMessage.conversationId ? {...c, lastMessage: newMessage, isUnread: c._id !== selectedConversation?._id} : c));
            });
            
             socket.on("messagesSeen", ({ conversationId, userId }) => {
                if (conversationId === selectedConversation?._id) {
                    setMessages(prev => prev.map(m => ({ ...m, readBy: [...m.readBy, userId] })));
                }
            });

            return () => {
                socket.off("connect");
                socket.off("receiveMessage");
                socket.off("messagesSeen");
                socket.disconnect();
            };
        };

        socketInitializer();
    }, [selectedConversation?._id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    const handleSelectConversation = async (convo: Conversation) => {
        if (convo.isNew && authUser?.role === 'admin') {
            const recipient = convo.participants.find(p => p._id !== authUser._id);
            if (!recipient) return;

            const res = await fetch('/api/chat/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId: recipient._id })
            });
            const newConvo = await res.json();
            
            // Replace the 'new' conversation with the real one
            const updatedConvos = conversations.map(c => c._id === convo._id ? newConvo : c);
            setConversations(updatedConvos);
            setFilteredConversations(updatedConvos);

            setSelectedConversation(newConvo);
            setMessages([]);
            socket.emit("join", newConvo._id);
            return;
        }

        setSelectedConversation(convo);
        setMessages([]);

        try {
            const res = await fetch(`/api/chat/messages/${convo._id}`);
            if (!res.ok) throw new Error("Failed to fetch messages");
            const data = await res.json();
            setMessages(data);
            
            socket.emit("join", convo._id);
            socket.emit("messagesSeen", { conversationId: convo._id, userId: authUser?._id });

            // Mark conversation as read
            const markAsRead = (convos: Conversation[]) => convos.map(c => c._id === convo._id ? { ...c, isUnread: false } : c);
            setConversations(markAsRead);
            setFilteredConversations(markAsRead);
            
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Could not fetch messages" });
        }
    };

    const handleSendMessage = async (data: { message: string }) => {
        if (!selectedConversation || !data.message.trim()) return;

        try {
            const res = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId: selectedConversation._id, content: data.message }),
            });
            if (!res.ok) throw new Error("Failed to send message");
            const newMessage: Message = await res.json();
            setMessages(prev => [...prev, newMessage]);
            
            const updatedConvos = conversations.map(c => c._id === newMessage.conversationId ? { ...c, lastMessage: newMessage } : c);
            setConversations(updatedConvos);
            setFilteredConversations(updatedConvos);

            socket.emit("sendMessage", newMessage);
            form.reset();
        } catch (error) {
             toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Could not send message" });
        }
    };
    
     const handleFilterChange = (role: string) => {
        if (role === 'all') {
            setFilteredConversations(conversations);
        } else {
            setFilteredConversations(
                conversations.filter(c => c.participants.some(p => p._id !== authUser?._id && p.role === role))
            );
        }
    };

    if (isLoading) return <ChatPageSkeleton />;
    if (!authUser) return <p>You need to be logged in.</p>;

    const renderMessageStatus = (message: Message) => {
        const otherParticipant = selectedConversation?.participants.find(p => p._id !== authUser._id);
        if (!otherParticipant) return null;
        
        const isRead = message.readBy.includes(otherParticipant._id);
        
        if (isRead) {
            return <CheckCheck className="h-4 w-4 text-blue-500" />;
        }
        return <Check className="h-4 w-4 text-muted-foreground" />;
    };
    
    return (
        <Card className="h-full w-full flex flex-col">
            <CardContent className="grid md:grid-cols-[300px_1fr] flex-1 p-0 min-h-0">
                {/* Conversation List */}
                <div className={cn("border-r h-full flex-col", authUser.role === 'admin' ? 'flex' : 'hidden md:flex')}>
                    <div className="p-4 border-b">
                        {authUser.role === 'admin' ? (
                            <Select onValueChange={handleFilterChange} defaultValue="all">
                                <SelectTrigger><SelectValue placeholder="Filter by role" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="user">Users</SelectItem>
                                    <SelectItem value="provider">Providers</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                             <h2 className="text-lg font-semibold">Support Chat</h2>
                        )}
                    </div>
                     <ScrollArea className="flex-1">
                        {filteredConversations.length > 0 ? filteredConversations
                            .sort((a,b) => new Date(b.lastMessage?.createdAt || b.updatedAt).getTime() - new Date(a.lastMessage?.createdAt || a.updatedAt).getTime())
                            .map(convo => {
                            const otherUser = convo.participants.find(p => p._id !== authUser._id);
                            if (!otherUser) return null;
                            
                            return (
                                <div key={convo._id}
                                    onClick={() => handleSelectConversation(convo)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 m-2 rounded-lg cursor-pointer hover:bg-secondary",
                                        {"bg-secondary": selectedConversation?._id === convo._id},
                                        {"font-bold": convo.isUnread}
                                    )}
                                >
                                    <div className="relative">
                                        <Avatar>
                                            <AvatarImage src={otherUser.profilePhoto} />
                                            <AvatarFallback>{otherUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                         {convo.isUnread && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="truncate">{otherUser.name}</p>
                                        <p className={cn("text-xs text-muted-foreground truncate", {"text-foreground": convo.isUnread})}>
                                            {convo.lastMessage ? convo.lastMessage.content : `Role: ${otherUser.role}`}
                                        </p>
                                    </div>
                                </div>
                            )
                        }) : <p className="p-4 text-sm text-muted-foreground">No conversations found.</p>}
                    </ScrollArea>
                </div>

                {/* Message Area */}
                 <div className="flex flex-col h-full">
                    {selectedConversation ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b flex items-center gap-3">
                                <Avatar>
                                     <AvatarImage src={selectedConversation.participants.find(p => p._id !== authUser._id)?.profilePhoto} />
                                     <AvatarFallback>{selectedConversation.participants.find(p => p._id !== authUser._id)?.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{selectedConversation.participants.find(p => p._id !== authUser._id)?.name}</p>
                                    <p className="text-xs text-muted-foreground">Joined {formatDistanceToNow(new Date(selectedConversation.participants.find(p => p._id !== authUser._id)?.createdAt || Date.now()))} ago</p>
                                </div>
                            </div>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                                {messages.map(message => (
                                    <div key={message._id} className={cn("flex items-end gap-2", message.sender._id === authUser._id ? "justify-end" : "justify-start")}>
                                        {message.sender._id !== authUser._id && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={message.sender.profilePhoto} />
                                                <AvatarFallback>{message.sender.name.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg", message.sender._id === authUser._id ? "bg-primary text-primary-foreground" : "bg-secondary")}>
                                            <p className="text-sm">{message.content}</p>
                                            <div className={cn("flex items-center gap-1.5 text-xs mt-1", message.sender._id === authUser._id ? "text-primary-foreground/70 justify-end" : "text-muted-foreground")}>
                                                <span>{format(new Date(message.createdAt), 'p')}</span>
                                                {message.sender._id === authUser._id && renderMessageStatus(message)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            {/* Input */}
                            <div className="p-4 border-t">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleSendMessage)} className="flex items-center gap-2">
                                        <FormField control={form.control} name="message" render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <Input placeholder="Type a message..." autoComplete="off" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                        <Button type="submit" size="icon" disabled={form.formState.isSubmitting}>
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </Form>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                           <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                           <h3 className="text-xl font-semibold">Select a conversation</h3>
                           <p className="text-muted-foreground">Choose a user from the list to start chatting.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
