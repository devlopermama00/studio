
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { uploadFile } from "@/services/fileUploader";
import Image from "next/image";

const settingsFormSchema = z.object({
  siteName: z.string().min(3, "Site name must be at least 3 characters.").optional(),
  siteDescription: z.string().max(200, "Description must be less than 200 characters.").optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {},
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/admin/settings');
                if (!response.ok) throw new Error("Failed to fetch settings.");
                const data = await response.json();
                form.reset({
                    siteName: data.siteName || "",
                    siteDescription: data.siteDescription || "",
                    primaryColor: data.primaryColor || "",
                    accentColor: data.accentColor || "",
                });
                setLogoUrl(data.logoUrl || null);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Could not load site settings." });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [form, toast]);

    const handleSave = async (values: SettingsFormValues) => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (!response.ok) throw new Error("Failed to save settings.");

            toast({ title: "Success", description: "General settings have been updated. Refresh to see theme changes." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not save settings." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploadingLogo(true);
        try {
            const uploadedUrl = await uploadFile(file, 'site-assets');
            
            const response = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logoUrl: uploadedUrl }),
            });
            if (!response.ok) throw new Error("Failed to save new logo.");

            setLogoUrl(uploadedUrl);
            toast({ title: "Success", description: "Logo has been updated." });
        } catch (error) {
            toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload new logo." });
        } finally {
            setIsUploadingLogo(false);
        }
    };
    
    if (isLoading) {
        return <Skeleton className="h-[500px] w-full" />;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)}>
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Site Settings</CardTitle>
                            <CardDescription>Manage global settings for your site.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="space-y-2">
                                <FormLabel htmlFor="logo">Logo Upload</FormLabel>
                                <div className="flex items-center gap-4">
                                    {logoUrl && <Image src={logoUrl} alt="logo" width={120} height={40} className="h-10 w-auto bg-muted p-1 rounded-md" />}
                                    <Input id="logo" type="file" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                                    {isUploadingLogo && <Loader2 className="h-5 w-5 animate-spin" />}
                                </div>
                                <p className="text-sm text-muted-foreground">Recommended size: 200x50px. Uploading a new logo saves it immediately.</p>
                            </div>
                            <FormField name="siteName" render={({ field }) => (
                                <FormItem><FormLabel>Site Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField name="siteDescription" render={({ field }) => (
                                <FormItem><FormLabel>Site Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormDescription>Used for SEO and browser tabs.</FormDescription><FormMessage /></FormItem>
                            )} />
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormField name="primaryColor" render={({ field }) => (
                                    <FormItem><FormLabel>Primary Color (HSL)</FormLabel><FormControl><Input {...field} placeholder="e.g. 204 75% 50%" /></FormControl><FormDescription>Changes the main brand color of the site.</FormDescription><FormMessage /></FormItem>
                                )} />
                                <FormField name="accentColor" render={({ field }) => (
                                    <FormItem><FormLabel>Accent Color (HSL)</FormLabel><FormControl><Input {...field} placeholder="e.g. 174 50% 50%" /></FormControl><FormDescription>Used for highlights and secondary elements.</FormDescription><FormMessage /></FormItem>
                                )} />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save General Settings
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Stripe API Credentials</CardTitle>
                            <CardDescription>Manage your payment gateway integration. Keys are read-only for security and should be set in your environment variables.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <FormLabel htmlFor="stripe-pk">Publishable Key</FormLabel>
                                <Input id="stripe-pk" value="pk_test_************************" readOnly />
                            </div>
                            <div className="space-y-2">
                                <FormLabel htmlFor="stripe-sk">Secret Key</FormLabel>
                                <Input id="stripe-sk" value="sk_test_************************" readOnly />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </Form>
    );
}
