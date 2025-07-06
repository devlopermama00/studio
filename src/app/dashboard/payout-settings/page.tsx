
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Banknote, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const payoutFormSchema = z.object({
  paypalEmail: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  bankDetails: z.object({
    accountHolderName: z.string().optional(),
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    iban: z.string().optional(),
    swiftCode: z.string().optional(),
  }).optional(),
});

type PayoutFormValues = z.infer<typeof payoutFormSchema>;

const PayoutSettingsSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-10 w-48 mb-6" />
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-24" />
            </div>
        </CardContent>
    </Card>
);

export default function PayoutSettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<PayoutFormValues>({
        resolver: zodResolver(payoutFormSchema),
        defaultValues: {
            paypalEmail: "",
            bankDetails: {
                accountHolderName: "",
                accountNumber: "",
                bankName: "",
                iban: "",
                swiftCode: "",
            }
        },
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/provider/payout-settings');
                if (!response.ok) {
                    if (response.status === 404) return;
                    throw new Error("Failed to fetch payout settings.");
                }
                const data = await response.json();
                if (data) {
                    form.reset(data);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({ variant: "destructive", title: "Error", description: errorMessage });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [form, toast]);

    async function onSubmit(values: PayoutFormValues) {
        setIsSaving(true);
        try {
            const response = await fetch('/api/provider/payout-settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to update settings.");
            toast({ title: "Success", description: "Your payout settings have been saved." });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Save Failed", description: errorMessage });
        } finally {
            setIsSaving(false);
        }
    }
    
    if (isLoading) {
        return <PayoutSettingsSkeleton />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payout Settings</CardTitle>
                <CardDescription>
                    Configure how you want to receive your earnings. Payouts are processed monthly.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Tabs defaultValue="paypal" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="paypal">
                                    <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M7.344 3.428h8.037c4.684 0 4.684.218 4.54.343-1.42 1.25-2.227 2.76-2.583 4.491-.355 1.73-.142 3.394.852 4.962.994 1.567 2.442 2.825 4.354 3.791.143.072.214.143.214.359.072 1.066-.64 1.137-1.137 1.137h-2.91c-.426 0-.782.284-.924.639l-1.066 2.772c-.142.426-.497.71-1.066.71h-2.487c-.568 0-.924-.284-.782-.852l1.35-3.553c.072-.213.072-.355 0-.568-.142-.213-.355-.355-.568-.355h-.71c-1.35 0-2.558-.782-3.126-2.06l-1.563-3.41c-.284-.639-.284-1.35 0-1.99.284-.639.782-1.137 1.492-1.28l3.483-.71Z"/></svg>
                                    PayPal
                                </TabsTrigger>
                                <TabsTrigger value="bank">
                                    <Banknote className="mr-2 h-4 w-4" /> Bank Account
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="paypal" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>PayPal Account</CardTitle>
                                        <CardDescription>Enter your PayPal email address to receive payouts.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <FormField
                                            control={form.control}
                                            name="paypalEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PayPal Email</FormLabel>
                                                    <FormControl><Input placeholder="you@example.com" {...field} value={field.value ?? ''} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="bank" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Bank Account Details</CardTitle>
                                        <CardDescription>Fill in your bank details for direct transfers. All fields are optional but recommended for smooth processing.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField control={form.control} name="bankDetails.accountHolderName" render={({ field }) => (<FormItem><FormLabel>Account Holder Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="bankDetails.bankName" render={({ field }) => (<FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input placeholder="Bank of Georgia" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="bankDetails.iban" render={({ field }) => (<FormItem><FormLabel>IBAN</FormLabel><FormControl><Input placeholder="GE29NB0000000100100100" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="bankDetails.swiftCode" render={({ field }) => (<FormItem><FormLabel>SWIFT/BIC</FormLabel><FormControl><Input placeholder="BAGAGE22" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                         <FormField control={form.control} name="bankDetails.accountNumber" render={({ field }) => (<FormItem><FormLabel>Account Number (if no IBAN)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                        <div className="mt-6">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" /> Save Settings
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
