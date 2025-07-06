
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data for chat UI foundation
const mockConversations = [
  { id: 1, name: "Admin Support", lastMessage: "Yes, we can help with that.", unread: 0, avatar: "https://placehold.co/100x100.png" },
  { id: 2, name: "Kazbegi Tour Provider", lastMessage: "Your booking is confirmed!", unread: 2, avatar: "https://placehold.co/100x100.png" },
  { id: 3, name: "Tbilisi Walking Tour", lastMessage: "See you tomorrow at 10 AM.", unread: 0, avatar: "https://placehold.co/100x100.png" },
];

const mockMessages = {
  1: [
    { sender: "other", text: "Hello! I have a question about my booking." },
    { sender: "me", text: "Hi there, what can I help you with?" },
    { sender: "other", text: "I need to change the date of my tour." },
    { sender: "other", text: "Is it possible to move it to next Friday?" },
    { sender: "me", text: "Let me check that for you." },
    { sender: "other", text: "Yes, we can help with that." },
  ],
  2: [
    { sender: "other", text: "Your booking is confirmed!" },
  ],
  3: [
     { sender: "other", text: "See you tomorrow at 10 AM." },
  ]
};

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);

  return (
    <Card className="h-[calc(100vh-10rem)] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MessageSquare/> Support Chat</CardTitle>
        <CardDescription>
          This is a placeholder for the real-time chat system.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden p-0">
        {/* Conversation List */}
        <div className="flex flex-col border-r">
            <div className="p-4 border-b">
                <Input placeholder="Search conversations..." />
            </div>
            <ScrollArea className="flex-1">
                 {mockConversations.map(conv => (
                    <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={cn(
                            "flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary",
                            selectedConversation.id === conv.id && "bg-secondary"
                        )}
                    >
                        <Avatar>
                            <AvatarImage src={conv.avatar} alt={conv.name} />
                            <AvatarFallback>{conv.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="font-semibold truncate">{conv.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                        </div>
                        {conv.unread > 0 && (
                            <div className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {conv.unread}
                            </div>
                        )}
                    </div>
                ))}
            </ScrollArea>
        </div>
        {/* Chat Window */}
        <div className="md:col-span-2 flex flex-col h-full">
            {selectedConversation ? (
                <>
                <div className="p-4 border-b flex items-center gap-3">
                     <Avatar>
                        <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                        <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold">{selectedConversation.name}</h3>
                </div>
                 <ScrollArea className="flex-1 p-6">
                    <div className="space-y-4">
                        {(mockMessages as any)[selectedConversation.id].map((msg: any, index: number) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-end gap-2 max-w-[80%]",
                                    msg.sender === 'me' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                )}
                            >
                                <div
                                    className={cn(
                                        "rounded-lg p-3",
                                        msg.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                                    )}
                                >
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t">
                    <form className="flex items-center gap-2">
                        <Input placeholder="Type a message..." className="flex-1" autoComplete="off" />
                        <Button type="submit" size="icon">
                            <Send className="h-4 w-4"/>
                        </Button>
                    </form>
                </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Select a conversation to start chatting.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
