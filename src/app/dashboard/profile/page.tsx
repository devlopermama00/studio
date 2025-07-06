"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'provider' | 'admin';
  bio?: string;
  profilePhoto?: string;
  createdAt: string;
}

const ProfileSkeleton = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <Skeleton className="h-10 w-24" />
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-1/4" />
        </CardContent>
    </Card>
);


export default function ProfilePage() {
    const { toast } = useToast();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/user/profile');
                if (!response.ok) throw new Error("Failed to fetch profile");
                const data = await response.json();
                setUser(data);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Could not load your profile." });
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [toast]);
    
    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (!user) {
        return <Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent>Could not load profile. Please try again later.</CardContent></Card>;
    }

  return (
    <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={user.profilePhoto || ""} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-3xl font-bold font-headline flex items-center gap-2">{user.name} <Badge className="capitalize text-sm">{user.role}</Badge></CardTitle>
                    <CardDescription className="mt-1">{user.email}</CardDescription>
                </div>
            </div>
             <Button asChild>
                <Link href="/dashboard/settings">Edit Profile</Link>
            </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
            <div>
                <h3 className="font-semibold text-lg">Bio</h3>
                <p className="text-muted-foreground mt-1">
                    {user.bio || "No bio provided yet. You can add one in the settings."}
                </p>
            </div>
             <div>
                <h3 className="font-semibold text-lg">Member Since</h3>
                <p className="text-muted-foreground mt-1">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
        </CardContent>
    </Card>
  );
}
