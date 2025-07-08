
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const blogSettingsSchema = z.object({
  blog_page_title: z.string().optional(),
  blog_page_description: z.string().optional(),
});

type BlogSettingsValues = z.infer<typeof blogSettingsSchema>;

export function BlogSettingsForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<BlogSettingsValues>({
        resolver: zodResolver(blogSettingsSchema),
        defaultValues: {
            blog_page_title: "",
            blog_page_description: "",
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
    

    const handleSave = async (values: BlogSettingsValues) => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (!response.ok) throw new Error("Failed to save blog settings.");

            toast({ title: "Success", description: "Blog page settings have been updated." });
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
                    <FormField name="blog_page_title" render={({ field }) => (<FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} placeholder="TourVista Georgia Blog" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField name="blog_page_description" render={({ field }) => (<FormItem><FormLabel>Page Description</FormLabel><FormControl><Input {...field} placeholder="Travel tips, destination guides, and stories from the heart of Georgia." /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Blog Settings
                    </Button>
                </CardFooter>
            </form>
        </Form>
    );
}
