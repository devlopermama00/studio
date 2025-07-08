
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Trash2, PlusCircle, Upload } from "lucide-react";
import { uploadFile } from "@/services/fileUploader";

const destinationItemSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    hint: z.string().optional(),
});

const destinationsSettingsSchema = z.object({
  destinations_page_title: z.string().optional(),
  destinations_page_description: z.string().optional(),
  destinations_page_items: z.array(destinationItemSchema).optional(),
});

type DestinationsSettingsValues = z.infer<typeof destinationsSettingsSchema>;

export function DestinationsSettingsForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<DestinationsSettingsValues>({
        resolver: zodResolver(destinationsSettingsSchema),
        defaultValues: {
            destinations_page_title: "",
            destinations_page_description: "",
            destinations_page_items: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "destinations_page_items",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const settingsRes = await fetch('/api/admin/settings');
                if (!settingsRes.ok) throw new Error("Failed to fetch settings.");
                const settingsData = await settingsRes.json();
                form.reset({
                    destinations_page_title: settingsData.destinations_page_title || "",
                    destinations_page_description: settingsData.destinations_page_description || "",
                    destinations_page_items: settingsData.destinations_page_items || [],
                });
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Could not load settings data." });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [form, toast]);
    
    const handleFileUpload = async (file: File | null, fieldName: any, index?: number) => {
        if (!file) return;
        
        setIsSaving(true);
        try {
            const url = await uploadFile(file, 'destination-assets');
            if (index !== undefined) {
                form.setValue(fieldName, url, { shouldValidate: true });
            } else {
                 form.setValue(fieldName, url, { shouldValidate: true });
            }
            toast({ title: "Image Uploaded" });
        } catch (error) {
             toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload image." });
        } finally {
            setIsSaving(false);
        }
    }

    const handleSave = async (values: DestinationsSettingsValues) => {
        setIsSaving(true);
        try {
            const filteredValues = {
                ...values,
                destinations_page_items: values.destinations_page_items?.filter(
                    item => item.name && item.description && item.image
                ),
            };

            const response = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filteredValues),
            });
            if (!response.ok) throw new Error("Failed to save destinations settings.");

            toast({ title: "Success", description: "Destinations settings have been updated." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not save settings." });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <CardContent><Skeleton className="h-96 w-full" /></CardContent>;
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)}>
                <CardContent className="space-y-8">
                    {/* Page Content */}
                    <div className="space-y-4">
                        <FormLabel className="text-lg font-semibold">Destinations Page Content</FormLabel>
                        <FormField name="destinations_page_title" render={({ field }) => (<FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} placeholder="Discover Georgia, Destination by Destination" /></FormControl><FormMessage /></FormItem>)} />
                        <FormField name="destinations_page_description" render={({ field }) => (<FormItem><FormLabel>Page Description</FormLabel><FormControl><Input {...field} placeholder="From the ancient streets of Tbilisi..." /></FormControl><FormMessage /></FormItem>)} />
                    </div>

                    {/* Destination Items */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                             <div>
                                <FormLabel className="text-lg font-semibold">Destination Cards</FormLabel>
                                <p className="text-sm text-muted-foreground">Add or remove destinations that appear on the page.</p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", description: "", image: "", hint: "" })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Destination
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 items-start p-4 border rounded-lg bg-secondary/50">
                                    <div className="flex-1 space-y-4">
                                        <FormField name={`destinations_page_items.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField name={`destinations_page_items.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField name={`destinations_page_items.${index}.image`} render={({ field: formField }) => (
                                            <FormItem>
                                                <FormLabel>Image</FormLabel>
                                                <div className="flex items-center gap-2">
                                                    <Input placeholder="Image URL" {...formField} />
                                                    <Input type="file" className="hidden" id={`destination-upload-${index}`} onChange={e => handleFileUpload(e.target.files?.[0] || null, `destinations_page_items.${index}.image`, index)} />
                                                    <Button asChild type="button" variant="outline"><label htmlFor={`destination-upload-${index}`}><Upload className="h-4 w-4" /></label></Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                         )} />
                                        <FormField name={`destinations_page_items.${index}.hint`} render={({ field }) => (<FormItem><FormLabel>Image Search Hint</FormLabel><FormControl><Input {...field} placeholder="e.g. tbilisi georgia" /></FormControl><FormMessage /></FormItem>)} />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Destinations
                    </Button>
                </CardFooter>
            </form>
        </Form>
    );
}
