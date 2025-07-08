
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const footerSettingsSchema = z.object({
  footer_title: z.string().optional(),
  footer_description: z.string().optional(),
  footer_facebook_url: z.string().url().or(z.literal('')).optional(),
  footer_twitter_url: z.string().url().or(z.literal('')).optional(),
  footer_instagram_url: z.string().url().or(z.literal('')).optional(),
  footer_pinterest_url: z.string().url().or(z.literal('')).optional(),
  footer_linkedin_url: z.string().url().or(z.literal('')).optional(),
  footer_copyright_text: z.string().optional(),
});

type FooterSettingsValues = z.infer<typeof footerSettingsSchema>;

export function FooterSettingsForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<FooterSettingsValues>({
        resolver: zodResolver(footerSettingsSchema),
        defaultValues: {
            footer_title: "",
            footer_description: "",
            footer_facebook_url: "",
            footer_twitter_url: "",
            footer_instagram_url: "",
            footer_pinterest_url: "",
            footer_linkedin_url: "",
            footer_copyright_text: "",
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const settingsRes = await fetch('/api/admin/settings');
                if (!settingsRes.ok) throw new Error("Failed to fetch settings.");
                const settingsData = await settingsRes.json();
                form.reset(settingsData);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Could not load settings data." });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [form, toast]);
    

    const handleSave = async (values: FooterSettingsValues) => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (!response.ok) throw new Error("Failed to save footer settings.");

            toast({ title: "Success", description: "Footer settings have been updated." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not save settings." });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <CardContent><Skeleton className="h-48 w-full" /></CardContent>;
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)}>
                <CardContent className="space-y-8">
                     <FormField name="footer_title" render={({ field }) => (<FormItem><FormLabel>Footer Title</FormLabel><FormControl><Input {...field} placeholder="DayTourGuides" /></FormControl><FormMessage /></FormItem>)} />
                     <FormField name="footer_description" render={({ field }) => (<FormItem><FormLabel>Footer Description</FormLabel><FormControl><Textarea {...field} placeholder="Your gateway to unforgettable adventures..." /></FormControl><FormMessage /></FormItem>)} />
                     <div className="space-y-4">
                        <FormLabel>Social Media Links</FormLabel>
                        <CardDescription>Leave a field blank to hide the icon.</CardDescription>
                         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormField name="footer_facebook_url" render={({ field }) => (<FormItem><FormLabel>Facebook URL</FormLabel><FormControl><Input {...field} placeholder="https://facebook.com/..." /></FormControl><FormMessage /></FormItem>)} />
                            <FormField name="footer_twitter_url" render={({ field }) => (<FormItem><FormLabel>Twitter (X) URL</FormLabel><FormControl><Input {...field} placeholder="https://twitter.com/..." /></FormControl><FormMessage /></FormItem>)} />
                            <FormField name="footer_instagram_url" render={({ field }) => (<FormItem><FormLabel>Instagram URL</FormLabel><FormControl><Input {...field} placeholder="https://instagram.com/..." /></FormControl><FormMessage /></FormItem>)} />
                            <FormField name="footer_pinterest_url" render={({ field }) => (<FormItem><FormLabel>Pinterest URL</FormLabel><FormControl><Input {...field} placeholder="https://pinterest.com/..." /></FormControl><FormMessage /></FormItem>)} />
                            <FormField name="footer_linkedin_url" render={({ field }) => (<FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input {...field} placeholder="https://linkedin.com/..." /></FormControl><FormMessage /></FormItem>)} />
                         </div>
                     </div>
                     <FormField name="footer_copyright_text" render={({ field }) => (<FormItem><FormLabel>Copyright Text</FormLabel><FormControl><Input {...field} placeholder={`© ${new Date().getFullYear()} TourVista Georgia. All rights reserved.`} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Footer Settings
                    </Button>
                </CardFooter>
            </form>
        </Form>
    );
}
