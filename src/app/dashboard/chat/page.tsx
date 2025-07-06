
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for chat UI foundation with roles
const mockConversations = [
  { id: 1, name: "Alex Johnson (User)", role: "user", lastMessage: "Yes, we can help with that.", unread: 0, avatar: "https://placehold.co/100x100.png" },
  { id: 2, name: "Kazbegi Guides (Provider)", role: "provider", lastMessage: "Your booking is confirmed!", unread: 2, avatar: "https://placehold.co/100x100.png" },
  { id: 3, name: "Tbilisi Treks (Provider)", role: "provider", lastMessage: "See you tomorrow at 10 AM.", unread: 0, avatar: "https://placehold.co/100x100.png" },
  { id: 4, name: "Maria Garcia (User)", role: "user", lastMessage: "I have a question about my booking.", unread: 1, avatar: "https://placehold.co/100x100.png" },
];

const mockMessages = {
  1: [
    { sender: "other", text: "Hello! I have a question about my booking." },
    { sender: "me", text: "Hi there, what can I help you with?" },
    { sender: "other", text: "I need to change the date of my tour." },
  ],
  2: [
    { sender: "other", text: "Your booking is confirmed!" },
  ],
  3: [
     { sender: "other", text: "See you tomorrow at 10 AM." },
  ],
  4: [
      { sender: "other", text: "I have a question about my booking." },
  ]
};

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<any>(mockConversations[0]);
  const [filteredConversations, setFilteredConversations] = useState(mockConversations);

  const handleFilterChange = (filter: "all" | "user" | "provider") => {
      if (filter === "all") {
          setFilteredConversations(mockConversations);
      } else {
          setFilteredConversations(mockConversations.filter(c => c.role === filter));
      }
  };

  useEffect(() => {
    // If the selected conversation is not in the filtered list, select the first one from the filtered list, or null if empty
    if (!filteredConversations.find(c => c.id === selectedConversation?.id)) {
        setSelectedConversation(filteredConversations[0] || null);
    }
  }, [filteredConversations, selectedConversation]);


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
            <div className="p-4 border-b space-y-4">
                <Input placeholder="Search conversations..." />
                <Tabs defaultValue="all" onValueChange={(value) => handleFilterChange(value as any)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="user">Users</TabsTrigger>
                        <TabsTrigger value="provider">Providers</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <ScrollArea className="flex-1">
                 {filteredConversations.map(conv => (
                    <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={cn(
                            "flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary",
                            selectedConversation?.id === conv.id && "bg-secondary"
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
                        {(mockMessages as any)[selectedConversation.id]?.map((msg: any, index: number) => (
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
                        )) ?? <p className="text-center text-muted-foreground">No messages in this conversation.</p>}
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
