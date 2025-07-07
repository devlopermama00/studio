
"use client";

import { useState, useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";


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
  createdAt: string;
}

interface Conversation {
    _id: string;
    participants: User[];
    lastMessage?: Message | null;
    isNew?: boolean;
    updatedAt: string;
}


const chatFormSchema = z.object({
  message: z.string().min(1, "Message cannot be empty."),
});

type ChatFormValues = z.infer<typeof chatFormSchema>;

const ChatMessage = ({ msg, user }: { msg: Message, user: User }) => {
    const isSender = msg.sender._id === user._id;
    return (
        <div className={cn("flex items-end gap-3", isSender ? "justify-end" : "justify-start")}>
            {!isSender && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.sender.profilePhoto} alt={msg.sender.name} />
                    <AvatarFallback>{msg.sender.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
            )}
            <div className={cn(
                "max-w-xs md:max-w-md rounded-lg px-4 py-2",
                isSender
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-secondary rounded-bl-none"
            )}>
                <p className="text-sm break-words">{msg.content}</p>
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
    <Card className="h-[calc(100vh-10rem)] flex flex-col">
        <CardHeader>
             <Skeleton className="h-7 w-48" />
             <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden p-0">
             <div className="flex flex-col border-r">
                <div className="p-4 border-b space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex-1 p-2 space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
            <div className="md:col-span-2 flex flex-col h-full">
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
            </div>
        </CardContent>
    </Card>
)

export default function ChatPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);

    // Admin state
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isCreatingConvo, setIsCreatingConvo] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentFilter, setCurrentFilter] = useState("all");

    // All users state
    const [messages, setMessages] = useState<Message[]>([]);
    const [isSending, setIsSending] = useState(false);
    
    const scrollAreaRef = useRef<HTMLDivElement>(null);

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
                }
            } catch (e) {
                toast({ variant: 'destructive', title: 'Error', description: "Failed to fetch user data."})
            } finally {
                setIsLoading(false);
            }

            await fetch('/api/socket');
            const newSocket = io();
            setSocket(newSocket);
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
                if (selectedConversation?._id === newMessage.conversationId) {
                    setMessages((prev) => {
                        if (prev.some(msg => msg._id === newMessage._id)) return prev;
                        return [...prev, newMessage]
                    });
                } else {
                    // Update conversation list with new last message for unread indicator
                    setConversations(prev => prev.map(c => c._id === newMessage.conversationId ? {...c, lastMessage: newMessage} : c));
                    toast({title: "New Message", description: `From ${newMessage.sender.name}`})
                }
            });
        }
    }, [socket, user, selectedConversation, toast]);

    // Fetch conversations (or all users for admin)
    useEffect(() => {
        const fetchConversations = async () => {
            if (!user) return;
            try {
                const res = await fetch('/api/chat/conversations');
                if (res.ok) {
                    const data = await res.json();
                    if (user.role === 'admin') {
                        setConversations(data);
                    } else {
                        setSelectedConversation(data[0]);
                    }
                }
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Error', description: "Failed to fetch conversations."})
            }
        };
        fetchConversations();
    }, [user, toast]);

    // Apply filters and search to conversation list
    useEffect(() => {
        let filtered = conversations;

        if (user?.role === 'admin') {
            if (currentFilter !== "all") {
                filtered = filtered.filter(c => {
                    const otherParticipant = c.participants.find(p => p._id !== user?._id);
                    return otherParticipant?.role === currentFilter;
                });
            }

            if (searchTerm) {
                filtered = filtered.filter(c => {
                    const otherParticipant = c.participants.find(p => p._id !== user?._id);
                    return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        otherParticipant?.email.toLowerCase().includes(searchTerm.toLowerCase());
                });
            }
        }
        setFilteredConversations(filtered);
    }, [searchTerm, currentFilter, conversations, user]);


    // Fetch messages for selected conversation
    useEffect(() => {
        const fetchMessages = async () => {
            if (selectedConversation && !selectedConversation.isNew) {
                socket?.emit('join', selectedConversation._id);
                try {
                    const res = await fetch(`/api/chat/messages/${selectedConversation._id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setMessages(data);
                    }
                } catch (error) {
                    toast({ variant: 'destructive', title: 'Error', description: "Failed to fetch messages."})
                }
            } else if (selectedConversation?.isNew) {
                setMessages([]);
            }
        };
        fetchMessages();

        return () => {
            if (selectedConversation && !selectedConversation.isNew) {
                socket?.emit('leave', selectedConversation._id);
            }
        }

    }, [selectedConversation, socket, toast]);

    // Scroll to bottom on new message
     useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async (values: ChatFormValues) => {
        if (!socket || !selectedConversation || !user) return;
        setIsSending(true);

        const optimisticMessage: Message = {
            _id: `optimistic_${Date.now()}_${Math.random()}`,
            conversationId: selectedConversation._id,
            sender: user,
            content: values.message,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMessage]);
        form.reset();

        try {
            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: selectedConversation._id,
                    content: values.message,
                }),
            });
            const savedMessage = await response.json();
            if (!response.ok) throw new Error(savedMessage.message);
            
            socket.emit('sendMessage', savedMessage);
            setMessages(prev => prev.map(m => m._id === optimisticMessage._id ? savedMessage : m));

        } catch (error) {
             toast({ variant: "destructive", title: "Error", description: "Failed to send message." });
             setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id)); // Revert optimistic update
        } finally {
            setIsSending(false);
        }
    };

    const handleSelectConversation = async (conv: Conversation) => {
        if (conv.isNew) {
            setIsCreatingConvo(true);
            try {
                const otherParticipant = conv.participants.find(p => p._id !== user?._id);
                if (!otherParticipant) return;

                const res = await fetch('/api/chat/conversations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ recipientId: otherParticipant._id })
                });

                if (!res.ok) throw new Error('Failed to create conversation');
                
                const newRealConversation: Conversation = await res.json();
                
                // Replace the dummy conversation with the real one in the main list
                setConversations(prev => prev.map(c => c._id === conv._id ? { ...newRealConversation, isNew: false } : c));
                
                // Select the new conversation
                setSelectedConversation(newRealConversation);

            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not start conversation.' });
            } finally {
                setIsCreatingConvo(false);
            }
        } else {
            setSelectedConversation(conv);
        }
    };


    if (isLoading || !user) {
        return <ChatSkeleton />;
    }

    const otherParticipant = selectedConversation?.participants.find(p => p._id !== user._id);

    const AdminChatUI = (
        <Card className="h-[calc(100vh-10rem)] flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare/> Support Chat</CardTitle>
                <CardDescription>Manage conversations with all users and providers.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-0 overflow-hidden p-0">
                <div className="flex flex-col border-r h-full">
                    <div className="p-4 border-b space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search users..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                         <Tabs defaultValue="all" onValueChange={(value) => setCurrentFilter(value as any)}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="user">Users</TabsTrigger>
                                <TabsTrigger value="provider">Providers</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <ScrollArea className="flex-1">
                        {filteredConversations.length === 0 && <p className="text-center text-sm text-muted-foreground p-4">No users found.</p>}
                        {filteredConversations.map(conv => {
                           const participant = conv.participants.find(p => p._id !== user._id);
                           if (!participant) return null;
                           return (
                            <button key={conv._id} onClick={() => handleSelectConversation(conv)} className={cn("flex w-full text-left items-center gap-3 p-4 cursor-pointer hover:bg-secondary disabled:opacity-50", selectedConversation?._id === conv._id && "bg-secondary")} disabled={isCreatingConvo}>
                                <Avatar><AvatarImage src={participant.profilePhoto} alt={participant.name} /><AvatarFallback>{participant.name.charAt(0)}</AvatarFallback></Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold truncate flex items-center gap-2">{participant.name} <Badge variant="outline" className="capitalize">{participant.role}</Badge></p>
                                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage?.content || "Click to start conversation"}</p>
                                </div>
                            </button>
                           )
                        })}
                    </ScrollArea>
                </div>
                <div className="md:col-span-2 flex flex-col h-full">
                    {selectedConversation && otherParticipant ? (
                        <>
                            <div className="p-4 border-b flex items-center gap-3">
                                <Avatar><AvatarImage src={otherParticipant.profilePhoto} alt={otherParticipant.name} /><AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback></Avatar>
                                <h3 className="font-semibold">{otherParticipant.name}</h3>
                            </div>
                            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
                                <div className="space-y-4">
                                     {messages.map((msg) => (
                                        <ChatMessage key={msg._id} msg={msg} user={user} />
                                    ))}
                                </div>
                            </ScrollArea>
                            <div className="p-4 border-t">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleSendMessage)} className="flex items-center gap-2">
                                        <FormField control={form.control} name="message" render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <Input {...field} placeholder="Type a message..." className="flex-1" autoComplete="off" />
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                        <Button type="submit" size="icon" disabled={isSending}><Send className="h-4 w-4"/></Button>
                                    </form>
                                </Form>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                            <MessageSquare className="h-12 w-12"/>
                            <p className="font-medium">Select a user to start a conversation</p>
                            <p className="text-sm">Use the panel on the left to find and chat with any user.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

     const UserChatUI = (
         <Card className="h-[calc(100vh-10rem)] flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare/> Chat with Support</CardTitle>
                <CardDescription>Have a question? Our support team is here to help.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
                {selectedConversation && otherParticipant ? (
                <div className="flex-1 flex flex-col h-full">
                    <div className="p-4 border-b flex items-center gap-3 bg-secondary">
                        <Avatar><AvatarImage src={otherParticipant.profilePhoto} alt={otherParticipant.name} /><AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback></Avatar>
                        <h3 className="font-semibold">{otherParticipant.name}</h3>
                    </div>
                    <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <ChatMessage key={msg._id} msg={msg} user={user} />
                            ))}
                        </div>
                    </ScrollArea>
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

    return user.role === 'admin' ? AdminChatUI : UserChatUI;
}
