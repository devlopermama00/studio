
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import AdminChat from "./admin-chat";
import UserChat from "./user-chat";

interface AuthUser {
  role: "user" | "provider" | "admin";
}

const ChatPageSkeleton = () => (
    <div className="h-full flex items-center justify-center">
        <div className="w-full h-full space-y-4">
            <Skeleton className="h-[calc(100vh-10rem)] w-full" />
        </div>
    </div>
);


export default function ChatPage() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error("Failed to fetch user, redirecting to login", error);
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [router]);
    
    if (isLoading) {
        return <ChatPageSkeleton />;
    }

    if (!user) {
        return null;
    }

    return user.role === 'admin' ? <AdminChat /> : <UserChat authUser={user} />;
}
