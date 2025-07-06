"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import AdminDashboardPage from "./admin/page";
import AnalyticsPage from "./analytics/page"; // This is the provider dashboard
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Star, Map } from "lucide-react";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "provider" | "admin";
}

const UserDashboard = ({ user }: { user: AuthUser }) => {
    const stats = [
        { title: "Upcoming Bookings", value: "2", icon: BookOpen, description: "Ready for your next adventure." },
        { title: "Completed Tours", value: "12", icon: Map, description: "Memories made, stories to tell." },
        { title: "Reviews Written", value: "8", icon: Star, description: "Your feedback helps others." },
    ];
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold font-headline">Welcome back, {user.name}!</h1>
                <p className="text-muted-foreground">Here's a quick look at your adventures.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
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

            {user.role === 'user' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Become a Provider</CardTitle>
                        <CardDescription>Share your passion for Georgia with travelers from around the world. Start creating and managing your own tours today!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <button className="text-primary font-semibold">Learn more about providing tours</button>
                    </CardContent>
                </Card>
            )}
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
