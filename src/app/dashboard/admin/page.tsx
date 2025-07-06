
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Map, DollarSign, ShieldAlert } from "lucide-react";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminStats {
    totalRevenue: number;
    totalUsers: number;
    totalProviders: number;
    totalTours: number;
    totalPendingApprovals: number;
    pendingProviderApprovals: number;
    pendingTourApprovals: number;
    monthlyRevenue: { month: string; revenue: number }[];
}


const DashboardSkeleton = () => (
     <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[350px]" />
                </CardContent>
            </Card>
    </div>
)

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/admin/stats');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch dashboard data');
                }
                const data = await response.json();
                setStats(data);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: errorMessage
                })
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [toast]);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (!stats) {
        return <Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent>Could not load dashboard data. Please try again later.</CardContent></Card>;
    }

    const { totalRevenue, totalUsers, totalProviders, totalTours, totalPendingApprovals, pendingProviderApprovals, pendingTourApprovals, monthlyRevenue } = stats;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">From confirmed bookings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">All user roles</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProviders}</div>
                         <p className="text-xs text-muted-foreground">Verified & unverified</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tours</CardTitle>
                        <Map className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTours}</div>
                        <p className="text-xs text-muted-foreground">Approved & pending</p>
                    </CardContent>
                </Card>
                <Card className="bg-amber-100 dark:bg-amber-900/50 border-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPendingApprovals}</div>
                        <p className="text-xs text-amber-700 dark:text-amber-400">{pendingProviderApprovals} providers, {pendingTourApprovals} tours</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <RechartsBarChart data={monthlyRevenue}>
                            <XAxis
                                dataKey="month"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))',
                                }}
                                cursor={{ fill: "hsl(var(--secondary))" }}
                            />
                            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
