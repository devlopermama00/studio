
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Users, BarChart, Star, Megaphone } from "lucide-react";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface ProviderStats {
    totalRevenue: number;
    totalBookings: number;
    activeTours: number;
    averageRating: number;
    reviewCount: number;
    monthlyEarnings: { month: string; total: number }[];
    topTours: { title: string; bookings: number }[];
}

interface Notice {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
}

const ProviderDashboardSkeleton = () => (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[350px]" />
                </CardContent>
            </Card>
            <Card className="lg:col-span-3">
                 <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                </CardContent>
            </Card>
        </div>
        <Skeleton className="h-48" />
    </div>
)

export default function AnalyticsPage() {
    const [stats, setStats] = useState<ProviderStats | null>(null);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const [statsResponse, noticesResponse] = await Promise.all([
                    fetch('/api/provider/stats'),
                    fetch('/api/provider/notices')
                ]);

                if (!statsResponse.ok) {
                    const errorData = await statsResponse.json();
                    throw new Error(errorData.message || 'Failed to fetch dashboard data');
                }
                const statsData = await statsResponse.json();
                setStats(statsData);

                if (noticesResponse.ok) {
                    const noticesData = await noticesResponse.json();
                    setNotices(noticesData);
                } else {
                    console.error("Failed to fetch notices");
                }
                
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: errorMessage
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, [toast]);
    
    if (isLoading) {
        return <ProviderDashboardSkeleton />;
    }

    if (!stats) {
        return <Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent>Could not load dashboard data. Please try again later.</CardContent></Card>;
    }
    
    const { totalRevenue, totalBookings, activeTours, averageRating, reviewCount, monthlyEarnings, topTours } = stats;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">From all completed bookings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBookings}</div>
                        <p className="text-xs text-muted-foreground">Across all your tours</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tours</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeTours}</div>
                        <p className="text-xs text-muted-foreground">Approved and listed tours</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">Based on {reviewCount} reviews</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Monthly Earnings</CardTitle>
                        <CardDescription>Your total earnings for the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <RechartsBarChart data={monthlyEarnings}>
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
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        borderColor: 'hsl(var(--border))',
                                    }}
                                    cursor={{ fill: "hsl(var(--secondary))" }}
                                />
                                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Top Tours</CardTitle>
                        <CardDescription>Your most booked tours.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topTours.length > 0 ? (
                        <div className="space-y-4">
                           {topTours.map((tour, index) => (
                                <div key={index} className="flex items-center">
                                    <div>{tour.title}</div>
                                    <div className="ml-auto font-medium">{tour.bookings} bookings</div>
                                </div>
                           ))}
                        </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No bookings yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
             <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-primary" />
                            Admin Announcements
                        </CardTitle>
                        <CardDescription>
                            Important updates from the TourVista team.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {notices.length > 0 ? (
                            <div className="space-y-4">
                                {notices.map(notice => (
                                    <div key={notice._id} className="p-3 rounded-lg border bg-secondary/50">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-semibold">{notice.title}</p>
                                            <p className="text-xs text-muted-foreground">{format(new Date(notice.createdAt), "PPP")}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{notice.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No new announcements at the moment.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
