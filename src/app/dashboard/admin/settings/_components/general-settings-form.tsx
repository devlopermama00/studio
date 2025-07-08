"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { uploadFile } from "@/services/fileUploader";
import Image from "next/image";
import { HslColorInput } from "@/components/ui/hsl-color-input";

const settingsFormSchema = z.object({
  siteName: z.string().min(3, "Site name must be at least 3 characters.").optional(),
  siteDescription: z.string().max(200, "Description must be less than 200 characters.").optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  foregroundColor: z.string().optional(),
  mutedForegroundColor: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export function GeneralSettingsForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            siteName: "",
            siteDescription: "",
            primaryColor: "",
            accentColor: "",
            foregroundColor: "",
            mutedForegroundColor: "",
        },
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
                    foregroundColor: data.foregroundColor || "",
                    mutedForegroundColor: data.mutedForegroundColor || "",
                });
                setLogoUrl(data.logoUrl || null);
                setFaviconUrl(data.faviconUrl || null);
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
    
    const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploadingFavicon(true);
        try {
            const uploadedUrl = await uploadFile(file, 'site-assets');
            
            const payload = { 
                faviconUrl: uploadedUrl,
                faviconVersion: Date.now().toString()
            };

            const response = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error("Failed to save new favicon.");

            setFaviconUrl(uploadedUrl);
            toast({ title: "Success", description: "Favicon has been updated. Changes will apply on next page load." });
        } catch (error) {
            toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload new favicon." });
        } finally {
            setIsUploadingFavicon(false);
        }
    };

    if (isLoading) {
        return <Skeleton className="h-[500px] w-full" />;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)}>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <FormLabel htmlFor="logo">Logo Upload</FormLabel>
                            <div className="flex items-center gap-4">
                                {logoUrl && <Image src={logoUrl} alt="logo" width={120} height={40} className="h-10 w-auto bg-muted p-1 rounded-md" />}
                                <Input id="logo" type="file" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                                {isUploadingLogo && <Loader2 className="h-5 w-5 animate-spin" />}
                            </div>
                            <p className="text-sm text-muted-foreground">Recommended size: 200x50px. Uploading saves it immediately.</p>
                        </div>
                         <div className="space-y-2">
                            <FormLabel htmlFor="favicon">Favicon Upload</FormLabel>
                            <div className="flex items-center gap-4">
                                {faviconUrl && <Image src={faviconUrl} alt="favicon" width={40} height={40} className="h-10 w-10 bg-muted p-1 rounded-md" />}
                                <Input id="favicon" type="file" onChange={handleFaviconUpload} disabled={isUploadingFavicon} />
                                {isUploadingFavicon && <Loader2 className="h-5 w-5 animate-spin" />}
                            </div>
                            <p className="text-sm text-muted-foreground">Recommended: 48x48px (PNG/ICO). Uploading saves immediately.</p>
                        </div>
                    </div>
                    <FormField name="siteName" render={({ field }) => (
                        <FormItem><FormLabel>Site Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="siteDescription" render={({ field }) => (
                        <FormItem><FormLabel>Site Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormDescription>Used for SEO and browser tabs.</FormDescription><FormMessage /></FormItem>
                    )} />
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField name="primaryColor" render={({ field }) => (
                            <FormItem><FormLabel>Primary Color (HSL, HEX, or RGB)</FormLabel><FormControl><HslColorInput {...field} placeholder="e.g., 204 75% 50% or #00AEEF" /></FormControl><FormDescription>Changes the main brand color of the site.</FormDescription><FormMessage /></FormItem>
                        )} />
                        <FormField name="accentColor" render={({ field }) => (
                            <FormItem><FormLabel>Accent Color (HSL, HEX, or RGB)</FormLabel><FormControl><HslColorInput {...field} placeholder="e.g., 174 50% 50% or #47D1B5" /></FormControl><FormDescription>Used for highlights and secondary elements.</FormDescription><FormMessage /></FormItem>
                        )} />
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <FormField name="foregroundColor" render={({ field }) => (
                            <FormItem><FormLabel>Text Color</FormLabel><FormControl><HslColorInput {...field} placeholder="e.g., 204 10% 10% or #1A202C" /></FormControl><FormDescription>Changes the main text color of the site.</FormDescription><FormMessage /></FormItem>
                        )} />
                        <FormField name="mutedForegroundColor" render={({ field }) => (
                            <FormItem><FormLabel>Inactive Nav Link Color</FormLabel><FormControl><HslColorInput {...field} placeholder="e.g., 204 10% 40% or #5A6A7A" /></FormControl><FormDescription>Changes color of inactive nav links and other muted text.</FormDescription><FormMessage /></FormItem>
                        )} />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save General Settings
                    </Button>
                </CardFooter>
            </form>
        </Form>
    );
}
