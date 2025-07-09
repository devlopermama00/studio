
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { io, type Socket } from "socket.io-client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Check, CheckCheck, Loader2, ArrowLeft } from "lucide-react";

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

// Socket instance variable
let socket: Socket;

const AdminChatSkeleton = () => (
    <Card className="h-full">
        <CardContent className="flex h-full p-0">
            <div className="border-r h-full flex flex-col w-full md:max-w-xs">
                <div className="p-4 border-b"><Skeleton className="h-10 w-full" /></div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-2">
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
                </ScrollArea>
            </div>
            <div className="flex-1 flex-col h-full bg-secondary/50 hidden md:flex">
                 <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">Select a conversation</h3>
                    <p className="text-muted-foreground">Choose a user from the list to start chatting.</p>
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function AdminChat() {
    const [authUser, _setAuthUser] = useState<User | null>(null);
    const authUserRef = useRef<User | null>(null);
    const setAuthUser = (user: User | null) => {
        _setAuthUser(user);
        authUserRef.current = user;
    }

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const selectedConversationRef = useRef<Conversation | null>(null);

    useEffect(() => {
        selectedConversationRef.current = selectedConversation;
    }, [selectedConversation]);

    const form = useForm({ defaultValues: { message: "" } });

    // Socket Initializer and data fetch
    useEffect(() => {
        // Function to fetch initial data
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
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Could not load chat." });
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();

        // Initialize socket
        socketInitializer();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const socketInitializer = async () => {
        await fetch('/api/socket');
        socket = io(undefined!, {
            path: '/api/socket',
        });
        
        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        socket.on('receive_message', (newMessage: Message) => {
            const currentConvo = selectedConversationRef.current;
            const currentUser = authUserRef.current;
            
            // This is the sender, so replace the optimistic message
            if (currentUser && newMessage.sender._id === currentUser._id) {
                setMessages(prev => prev.map(m => m._id.startsWith('temp_') ? newMessage : m));
            } else if (currentConvo && newMessage.conversationId === currentConvo._id) {
                // This is the receiver, add the new message
                setMessages((prevMessages) => {
                    if (prevMessages.some(m => m._id === newMessage._id)) return prevMessages;
                    return [...prevMessages, newMessage];
                });
                if (currentUser) {
                    socket.emit('messages_seen', { conversationId: newMessage.conversationId, userId: currentUser._id });
                }
            }

            setConversations(prev => prev.map(c => 
                c._id === newMessage.conversationId 
                ? { ...c, lastMessage: newMessage, updatedAt: newMessage.createdAt, isUnread: c._id !== currentConvo?._id } 
                : c
            ).sort((a,b) => new Date(b.lastMessage?.createdAt || b.updatedAt).getTime() - new Date(a.lastMessage?.createdAt || a.updatedAt).getTime()));
        });
        
        socket.on('update_seen_status', ({ conversationId, userId }) => {
            const currentConvo = selectedConversationRef.current;
            if (currentConvo && conversationId === currentConvo._id) {
                 setMessages((prevMessages) => prevMessages.map(msg => ({
                     ...msg,
                     readBy: [...new Set([...(msg.readBy || []), userId])]
                 })));
            }
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });
    };
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

     const handleSelectConversation = async (convo: Conversation) => {
        if (!authUser) return;
        
        let targetConvo = convo;

        if (targetConvo.isNew) {
            const recipient = targetConvo.participants.find(p => p._id !== authUser._id);
            if (!recipient) return;
            try {
                const res = await fetch('/api/chat/conversations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ recipientId: recipient._id })
                });
                if (!res.ok) throw new Error("Could not create conversation.");

                const newConvoData = await res.json();

                setConversations(prev => {
                    const updatedConvos = prev.map(c => c._id === convo._id ? newConvoData : c);
                    const currentFilterValue = document.querySelector('[role="combobox"]')?.textContent?.toLowerCase() || 'all';
                    handleFilterChange(currentFilterValue, updatedConvos);
                    return updatedConvos;
                });
                
                targetConvo = newConvoData;
            } catch (error) {
                 toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "An unknown error occurred" });
                 return;
            }
        }
        
        setSelectedConversation(targetConvo);
        setMessages([]);
        
        if (socket && targetConvo?._id && !targetConvo._id.startsWith('new_')) {
             socket.emit('join_conversation', targetConvo._id);
        }

        if (targetConvo._id.startsWith('new_')) {
            return;
        }

        try {
            const res = await fetch(`/api/chat/messages/${targetConvo._id}`);
            if (!res.ok) throw new Error("Failed to fetch messages");
            const data = await res.json();
            setMessages(data);
            
            if (socket) {
                socket.emit('messages_seen', { conversationId: targetConvo._id, userId: authUser._id });
            }
            
            const markAsRead = (convos: Conversation[]) => convos.map(c => c._id === targetConvo._id ? { ...c, isUnread: false } : c);
            setConversations(prev => markAsRead(prev));
            setFilteredConversations(prev => markAsRead(prev));
            
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Could not fetch messages" });
        }
    };
    
    const handleSendMessage = async (data: { message: string }) => {
        if (!selectedConversation || !data.message.trim() || !authUser || !socket) return;
        
        const tempId = `temp_${Date.now()}`;
        const optimisticMessage: Message = {
            _id: tempId,
            conversationId: selectedConversation._id,
            sender: authUser,
            content: data.message,
            readBy: [authUser._id],
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimisticMessage]);

        socket.emit('send_message', {
            conversationId: selectedConversation._id,
            senderId: authUser._id,
            content: data.message.trim(),
        });

        form.reset();
    };
    
    const handleFilterChange = (role: string, source: Conversation[] = conversations) => {
        if (role === 'all') {
            setFilteredConversations(source);
        } else {
            setFilteredConversations(
                source.filter(c => c.participants.some(p => p._id !== authUser?._id && p.role === role))
            );
        }
    };

    const formatTimestamp = (dateString: string) => {
        const date = new Date(dateString);
        if (isToday(date)) return format(date, 'p');
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'dd/MM/yyyy');
    };
    
    const renderMessageStatus = (message: Message) => {
        if (!selectedConversation || !authUser) return null;
        if (message.sender._id !== authUser._id) return null;
        if (message._id.startsWith('temp_')) return <Loader2 className="h-4 w-4 animate-spin text-primary-foreground/70" />
        
        const otherParticipant = selectedConversation.participants.find(p => p._id !== authUser._id);
        if (!otherParticipant) return null;
        
        const isRead = message.readBy && message.readBy.includes(otherParticipant._id);
        
        if (isRead) return <CheckCheck className="h-4 w-4 text-primary-foreground" />;
        return <Check className="h-4 w-4 text-primary-foreground/70" />;
    };

    if (isLoading) return <AdminChatSkeleton />;

    return (
       <Card className="h-full bg-background fixed w-full md:w-[calc(97%-var(--sidebar-width))] ">
      <CardContent className="flex h-full p-0 ">
        {/* Sidebar / Conversation List */}
        <div
          className={cn(
            "border-r mb-28 flex flex-col  w-full md:max-w-sm pr-4 md:pr-0",
            selectedConversation ? "hidden md:flex" : "flex"
          )}
        >
          {/* Header: Filter */}
          <div className="sticky top-0 z-20 p-4 border-b bg-background">
            <Select
              onValueChange={(value) => handleFilterChange(value, conversations)}
              defaultValue="all"
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="provider">Providers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scrollable Chat List (mobile and desktop) */}
          <div className="flex-1 overflow-y-auto md:block ">
            <div className="space-y-1 p-2">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((convo) => {
                  const otherUser = convo.participants.find(
                    (p) => p._id !== authUser?._id
                  );
                  if (!otherUser) return null;

                  return (
                    <div
                      key={convo._id}
                      onClick={() => handleSelectConversation(convo)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent",
                        {
                          "bg-accent":
                            selectedConversation?._id === convo._id,
                        }
                      )}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={otherUser.profilePhoto} />
                          <AvatarFallback>
                            {otherUser.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {convo.isUnread && (
                          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <p
                            className={cn(
                              "truncate font-medium",
                              {
                                "font-bold text-foreground": convo.isUnread,
                              }
                            )}
                          >
                            {otherUser.name}
                          </p>
                          {convo.lastMessage && (
                            <p className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                              {formatTimestamp(convo.lastMessage.createdAt)}
                            </p>
                          )}
                        </div>
                        <p
                          className={cn(
                            "text-sm text-muted-foreground truncate",
                            {
                              "text-foreground": convo.isUnread,
                            }
                          )}
                        >
                          {convo.lastMessage
                            ? convo.lastMessage.content
                            : `Role: ${otherUser.role}`}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="p-4 text-sm text-muted-foreground">
                  No conversations found.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Chat Panel */}
        <div
          className={cn(
            "flex-1 flex flex-col h-full bg-muted pr-4 md:pr-0",
            selectedConversation ? "flex" : "hidden md:flex"
          )}
        >
          {selectedConversation && authUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-background sticky top-0 z-20 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar>
                  <AvatarImage
                    src={
                      selectedConversation.participants.find(
                        (p) => p._id !== authUser._id
                      )?.profilePhoto
                    }
                  />
                  <AvatarFallback>
                    {
                      selectedConversation.participants.find(
                        (p) => p._id !== authUser._id
                      )?.name.charAt(0).toUpperCase()
                    }
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {
                      selectedConversation.participants.find(
                        (p) => p._id !== authUser._id
                      )?.name
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined {formatDistanceToNow(
                      new Date(
                        selectedConversation.participants.find(
                          (p) => p._id !== authUser._id
                        )?.createdAt || Date.now()
                      )
                    )} ago
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-24 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={cn(
                      "flex items-end gap-2",
                      message.sender._id === authUser._id
                        ? "justify-end"
                        : "justify-start"
                    )}
                  >
                    {message.sender._id !== authUser._id && (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={message.sender.profilePhoto} />
                        <AvatarFallback>
                          {message.sender.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-xs md:max-w-sm p-3 rounded-xl shadow-sm",
                        message.sender._id === authUser._id
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-background rounded-bl-none"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div
                        className={cn(
                          "flex items-center gap-1.5 text-xs mt-1 ",
                          message.sender._id === authUser._id
                            ? "text-primary-foreground/70 justify-end "
                            : "text-muted-foreground justify-start"
                        )}
                      >
                        <span>{format(new Date(message.createdAt), "p")}</span>
                        {renderMessageStatus(message)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-background sticky bottom-0 z-20">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSendMessage)}
                    className="flex items-center gap-2"
                  >
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Type a message..."
                              autoComplete="off"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a user from the list to start chatting.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    );
}
