
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import AdminDashboardPage from "./admin/page";
import AnalyticsPage from "./analytics/page"; // This is the provider dashboard
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, Star, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "provider" | "admin";
}

interface UserStats {
    upcomingBookings: number;
    completedTours: number;
    reviewsWritten: number;
}

const UserDashboardSkeleton = () => (
    <div className="space-y-6">
        <div className="space-y-1">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
    </div>
);


const UserDashboard = ({ user }: { user: AuthUser }) => {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/user/stats');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch dashboard data');
                }
                const data = await response.json();
                setStats(data);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({ variant: "destructive", title: "Error", description: errorMessage });
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [toast]);
    
    if (isLoading) {
        return <UserDashboardSkeleton />;
    }

    const statCards = [
        { title: "Tours Wishlisted", value: stats?.upcomingBookings ?? 0, icon: Heart, description: "Your next potential adventures." },
        { title: "Completed Tours", value: stats?.completedTours ?? 0, icon: Map, description: "Memories made, stories to tell." },
        { title: "Reviews Written", value: stats?.reviewsWritten ?? 0, icon: Star, description: "Your feedback helps others." },
    ];
    
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold font-headline">Welcome back, {user.name}!</h1>
                <p className="text-muted-foreground">Here's a quick look at your adventures.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
};

const DashboardLoading = () => (
    <div className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
    </div>
);


export default function DashboardPage() {
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
        return <DashboardLoading />;
    }

    if (!user) {
        return null;
    }

    switch (user.role) {
        case 'admin':
            return <AdminDashboardPage />;
        case 'provider':
            return <AnalyticsPage />;
        case 'user':
        default:
            return <UserDashboard user={user} />;
    }
}
