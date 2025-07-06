
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Users, BarChart, Star, Banknote, FileText, CheckCircle, AlertCircle, Clock, Wallet } from "lucide-react";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";


// Define types for the data we'll be fetching
interface ProviderStats {
    totalRevenue: number; totalBookings: number; activeTours: number;
    averageRating: number; reviewCount: number;
    monthlyEarnings: { month: string; total: number }[];
    topTours: { title: string; bookings: number }[];
}
interface Provider { _id: string; name: string; }
interface PopulatedTour { _id: string; title: string; price: number; approved: boolean; blocked: boolean; images: string[]; }
interface PayoutSettings { paypalEmail?: string; bankDetails?: { accountHolderName?: string; accountNumber?: string; bankName?: string; iban?: string; swiftCode?: string; }; }
interface VerificationDocument { _id: string; status: 'pending' | 'approved' | 'rejected'; submittedAt: string; }


// Main Page Component
export default function ProviderViewPage() {
    const params = useParams();
    const router = useRouter();
    const providerId = params.providerId as string;
    const [provider, setProvider] = useState<Provider | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!providerId) return;

        const fetchProviderDetails = async () => {
            try {
                const res = await fetch(`/api/admin/users/${providerId}`);
                if (!res.ok) throw new Error('Failed to fetch provider details');
                const providerData = await res.json();
                setProvider(providerData);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "An unknown error occurred" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProviderDetails();
    }, [providerId, toast]);

    if (isLoading) {
        return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-[500px] w-full" /></div>;
    }

    if (!provider) {
        return <Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent>Could not load data for this provider.</CardContent></Card>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/admin/users')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Provider Dashboard</h1>
                    <p className="text-muted-foreground">Viewing analytics for: <span className="font-semibold text-foreground">{provider.name}</span></p>
                </div>
            </div>

             <Tabs defaultValue="analytics" className="w-full">
                <TabsList>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="tours">Tours</TabsTrigger>
                    <TabsTrigger value="payouts">Payout Settings</TabsTrigger>
                    <TabsTrigger value="verification">Verification</TabsTrigger>
                </TabsList>
                <TabsContent value="analytics" className="mt-4">
                    <AnalyticsTab providerId={providerId} />
                </TabsContent>
                <TabsContent value="tours" className="mt-4">
                    <ToursTab providerId={providerId} />
                </TabsContent>
                <TabsContent value="payouts" className="mt-4">
                    <PayoutsTab providerId={providerId} />
                </TabsContent>
                 <TabsContent value="verification" className="mt-4">
                    <VerificationTab providerId={providerId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}


// Analytics Tab Component
function AnalyticsTab({ providerId }: { providerId: string }) {
    const [stats, setStats] = useState<ProviderStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`/api/provider/stats?providerId=${providerId}`);
                if (!response.ok) throw new Error('Failed to fetch provider stats');
                setStats(await response.json());
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Could not load stats" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [providerId, toast]);

    if (isLoading) return <div className="space-y-4"><div className="grid gap-4 md:grid-cols-4"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div><Skeleton className="h-96" /></div>;
    if (!stats) return <p>Could not load analytics.</p>;
    
    const { totalRevenue, totalBookings, activeTours, averageRating, reviewCount, monthlyEarnings, topTours } = stats;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Revenue</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Bookings</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalBookings}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Tours</CardTitle><BarChart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{activeTours}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Average Rating</CardTitle><Star className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{averageRating.toFixed(1)}</div><p className="text-xs text-muted-foreground">Based on {reviewCount} reviews</p></CardContent></Card>
            </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4"><CardHeader><CardTitle>Monthly Earnings</CardTitle></CardHeader><CardContent className="pl-2"><ResponsiveContainer width="100%" height={350}><RechartsBarChart data={monthlyEarnings}><XAxis dataKey="month" stroke="#888888" fontSize={12} /><YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `$${value}`} /><Tooltip cursor={{ fill: "hsl(var(--secondary))" }} /><Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></RechartsBarChart></ResponsiveContainer></CardContent></Card>
                <Card className="lg:col-span-3"><CardHeader><CardTitle>Top Tours</CardTitle></CardHeader><CardContent>{topTours.length > 0 ? <div className="space-y-4">{topTours.map((tour, i) => (<div key={i} className="flex items-center"><div>{tour.title}</div><div className="ml-auto font-medium">{tour.bookings} bookings</div></div>))}</div> : <p className="text-sm text-muted-foreground">No bookings yet.</p>}</CardContent></Card>
            </div>
        </div>
    );
}

// Tours Tab Component
function ToursTab({ providerId }: { providerId: string }) {
    const [tours, setTours] = useState<PopulatedTour[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const response = await fetch(`/api/tours?providerId=${providerId}`);
                if (!response.ok) throw new Error('Failed to fetch tours');
                setTours(await response.json());
            } catch (error) {
                 toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Could not load tours" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchTours();
    }, [providerId, toast]);

    if (isLoading) return <Skeleton className="h-64 w-full" />;
    if (tours.length === 0) return <p>This provider has no tours.</p>;

    return (
        <Card>
            <CardHeader><CardTitle>Tours by this Provider</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Image</TableHead><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Price</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {tours.map(tour => (
                            <TableRow key={tour._id}>
                                <TableCell><Image alt={tour.title} className="aspect-square rounded-md object-cover" height="64" src={tour.images[0] || "https://placehold.co/64x64.png"} width="64" /></TableCell>
                                <TableCell className="font-medium">{tour.title}</TableCell>
                                <TableCell><Badge variant={tour.blocked ? "destructive" : tour.approved ? "default" : "secondary"}>{tour.blocked ? "Blocked" : tour.approved ? "Approved" : "Pending"}</Badge></TableCell>
                                <TableCell>${tour.price}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// Payouts Tab Component
function PayoutsTab({ providerId }: { providerId: string }) {
    const [settings, setSettings] = useState<PayoutSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`/api/provider/payout-settings?providerId=${providerId}`);
                if (!response.ok) throw new Error('Failed to fetch payout settings');
                setSettings(await response.json());
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Could not load settings" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [providerId, toast]);

    if (isLoading) return <Skeleton className="h-64 w-full" />;
    if (!settings || (!settings.paypalEmail && !settings.bankDetails)) return <p>Provider has not set up payout details.</p>;
    
    return (
        <Card>
            <CardHeader><CardTitle>Payout Settings</CardTitle><CardDescription>Read-only view of the provider's payout configuration.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                {settings.paypalEmail && <div className="flex items-center gap-2"><Wallet className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">PayPal Email</p><p>{settings.paypalEmail}</p></div></div>}
                {settings.bankDetails && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2"><Banknote className="h-5 w-5 text-muted-foreground" /><p className="font-semibold">Bank Details</p></div>
                        <p className="text-sm"><span className="text-muted-foreground">Holder:</span> {settings.bankDetails.accountHolderName || 'N/A'}</p>
                        <p className="text-sm"><span className="text-muted-foreground">Bank:</span> {settings.bankDetails.bankName || 'N/A'}</p>
                        <p className="text-sm"><span className="text-muted-foreground">IBAN:</span> {settings.bankDetails.iban || 'N/A'}</p>
                        <p className="text-sm"><span className="text-muted-foreground">SWIFT:</span> {settings.bankDetails.swiftCode || 'N/A'}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Verification Tab Component
function VerificationTab({ providerId }: { providerId: string }) {
    const [document, setDocument] = useState<VerificationDocument | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch(`/api/documents?providerId=${providerId}`);
                if (response.ok) setDocument(await response.json());
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Could not load verification status" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchStatus();
    }, [providerId, toast]);

    if (isLoading) return <Skeleton className="h-24 w-full" />;
    if (!document) return <p>Provider has not submitted any documents for verification.</p>;

    const statusConfig = {
        approved: { icon: CheckCircle, color: 'text-green-500', text: 'Documents are verified.' },
        pending: { icon: Clock, color: 'text-amber-500', text: 'Documents are under review.' },
        rejected: { icon: AlertCircle, color: 'text-red-500', text: 'Documents were rejected.' }
    };
    const currentStatus = statusConfig[document.status];
    const Icon = currentStatus.icon;

    return (
        <Card>
            <CardHeader><CardTitle>Verification Status</CardTitle></CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary">
                    <Icon className={`h-6 w-6 ${currentStatus.color}`} />
                    <div>
                        <p className="font-semibold">Status: <span className={`capitalize font-bold ${currentStatus.color}`}>{document.status}</span></p>
                        <p className="text-sm text-muted-foreground">{currentStatus.text} Submitted on {new Date(document.submittedAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
