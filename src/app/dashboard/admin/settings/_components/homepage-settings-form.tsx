
"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import { Loader2, Trash2, PlusCircle, Upload, GripVertical, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { uploadFile } from "@/services/fileUploader";
import Image from 'next/image';

const discoverItemSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    image: z.string().min(1, "Image URL is required"),
    hint: z.string().optional(),
});

const destinationItemSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    image: z.string().min(1, "Image URL is required"),
    hint: z.string().optional(),
});


const homepageSettingsSchema = z.object({
  homepage_hero_image: z.string().optional(),
  homepage_hero_title: z.string().optional(),
  homepage_hero_subtitle: z.string().optional(),

  homepage_popular_tours_title: z.string().optional(),
  homepage_popular_tours_description: z.string().optional(),
  homepage_popular_tours: z.array(z.string()).optional(),

  homepage_categories_title: z.string().optional(),
  homepage_categories_description: z.string().optional(),

  homepage_discover_title: z.string().optional(),
  homepage_discover_description: z.string().optional(),
  homepage_discover_items: z.array(discoverItemSchema).optional(),

  homepage_destinations_title: z.string().optional(),
  homepage_destinations_description: z.string().optional(),
  homepage_destinations: z.array(destinationItemSchema).optional(),
  
  homepage_offers_title: z.string().optional(),
  homepage_offers_description: z.string().optional(),
  
  homepage_newsletter_title: z.string().optional(),
  homepage_newsletter_description: z.string().optional(),
});

type HomepageSettingsValues = z.infer<typeof homepageSettingsSchema>;
type PopulatedTour = { _id: string, title: string };

export function HomepageSettingsForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [allTours, setAllTours] = useState<PopulatedTour[]>([]);

    const form = useForm<HomepageSettingsValues>({
        resolver: zodResolver(homepageSettingsSchema),
        defaultValues: {
            homepage_hero_image: "",
            homepage_hero_title: "",
            homepage_hero_subtitle: "",
            homepage_popular_tours_title: "",
            homepage_popular_tours_description: "",
            homepage_popular_tours: [],
            homepage_categories_title: "",
            homepage_categories_description: "",
            homepage_discover_title: "",
            homepage_discover_description: "",
            homepage_discover_items: [],
            homepage_destinations_title: "",
            homepage_destinations_description: "",
            homepage_destinations: [],
            homepage_offers_title: "",
            homepage_offers_description: "",
            homepage_newsletter_title: "",
            homepage_newsletter_description: "",
        },
    });

    const { fields: discoverFields, append: appendDiscover, remove: removeDiscover } = useFieldArray({
        control: form.control,
        name: "homepage_discover_items",
    });

    const { fields: destinationFields, append: appendDestination, remove: removeDestination } = useFieldArray({
        control: form.control,
        name: "homepage_destinations",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsRes, toursRes] = await Promise.all([
                    fetch('/api/admin/settings'),
                    fetch('/api/tours')
                ]);

                if (!settingsRes.ok) throw new Error("Failed to fetch settings.");
                const settingsData = await settingsRes.json();
                form.reset(settingsData);
                
                if (!toursRes.ok) throw new Error("Failed to fetch tours.");
                const toursData = await toursRes.json();
                setAllTours(toursData.filter((t: any) => t.approved && !t.blocked));

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
            const url = await uploadFile(file, 'homepage-assets');
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

    const handleHeroMediaUpload = async (file: File | null) => {
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadFile(file, 'homepage-assets');
            form.setValue('homepage_hero_image', url, { shouldValidate: true });

            // Save this single setting immediately
            const response = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ homepage_hero_image: url }),
            });
            if (!response.ok) throw new Error("Failed to save hero media.");

            toast({ title: "Success", description: "Hero media has been updated." });
        } catch (error) {
            toast({ variant: "destructive", title: "Upload Failed", description: error instanceof Error ? error.message : "Could not upload media." });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (values: HomepageSettingsValues) => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (!response.ok) throw new Error("Failed to save homepage settings.");

            toast({ title: "Success", description: "Homepage settings have been updated." });
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
                    {/* Hero Section */}
                    <div className="space-y-4">
                        <FormLabel className="text-lg font-semibold">Hero Section</FormLabel>
                        <FormField name="homepage_hero_title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} placeholder="Explore Georgia’s Best Day Tours" /></FormControl><FormMessage /></FormItem>)} />
                        <FormField name="homepage_hero_subtitle" render={({ field }) => (<FormItem><FormLabel>Subtitle</FormLabel><FormControl><Input {...field} placeholder="Book trusted experiences with verified guides." /></FormControl><FormMessage /></FormItem>)} />
                        
                        <FormField
                          name="homepage_hero_image"
                          render={({ field }) => (
                            <FormItem>
                                <FormLabel>Background Image/Video</FormLabel>
                                <div className="flex items-center gap-2">
                                    <Input
                                        readOnly
                                        placeholder="Upload media to see URL"
                                        value={typeof field.value === 'string' ? field.value : ''}
                                        className="flex-1 bg-muted"
                                    />
                                    <FormControl>
                                        <Button asChild type="button" variant="outline">
                                            <label htmlFor="hero-media-upload" className="cursor-pointer flex items-center">
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload
                                                <Input
                                                    id="hero-media-upload"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*,video/mp4,video/webm"
                                                    onChange={(e) => handleHeroMediaUpload(e.target.files?.[0] || null)}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        </Button>
                                    </FormControl>
                                </div>
                                {isUploading && <Loader2 className="h-5 w-5 animate-spin my-2" />}
                                
                                {field.value && typeof field.value === 'string' && !isUploading && (
                                    <div className="mt-2 relative w-full max-w-sm aspect-video">
                                        {(field.value.includes('.mp4') || field.value.includes('.webm')) ? (
                                            <video src={field.value} muted loop autoPlay playsInline className="rounded-md w-full h-full object-cover" />
                                        ) : (
                                            <Image src={field.value} alt="Hero preview" fill className="rounded-md object-cover" />
                                        )}
                                    </div>
                                )}
                              <FormDescription>Upload an image or a looping video for the hero section background. The current media is saved automatically upon successful upload.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                    
                    <Separator />

                    {/* Popular Tours Section */}
                     <div className="space-y-4">
                        <FormLabel className="text-lg font-semibold">Popular Tours Section</FormLabel>
                        <FormField name="homepage_popular_tours_title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} placeholder="Popular Tours" /></FormControl><FormMessage /></FormItem>)} />
                        <FormField name="homepage_popular_tours_description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} placeholder="Discover our most sought-after tours..." /></FormControl><FormMessage /></FormItem>)} />
                        <FormDescription>Select which tours appear on the homepage.</FormDescription>
                        <FormField
                          control={form.control}
                          name="homepage_popular_tours"
                          render={() => (
                            <FormItem className="space-y-3 mt-4 max-h-60 overflow-y-auto border p-4 rounded-md">
                              {allTours.map((tour) => (
                                <FormField
                                  key={tour._id}
                                  control={form.control}
                                  name="homepage_popular_tours"
                                  render={({ field }) => {
                                    return (
                                      <FormItem key={tour._id} className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(tour._id)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...(field.value || []), tour._id])
                                                : field.onChange(field.value?.filter((value) => value !== tour._id))
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">{tour.title}</FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </FormItem>
                          )}
                        />
                    </div>

                    <Separator />

                    {/* Category Section */}
                    <div className="space-y-4">
                        <FormLabel className="text-lg font-semibold">Browse by Category Section</FormLabel>
                        <FormField name="homepage_categories_title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} placeholder="Browse by Category" /></FormControl><FormMessage /></FormItem>)} />
                        <FormField name="homepage_categories_description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} placeholder="Find the type of adventure that suits you best." /></FormControl><FormMessage /></FormItem>)} />
                    </div>

                    <Separator />

                    {/* Discover Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                             <div>
                                <FormLabel className="text-lg font-semibold">"Discover" Section</FormLabel>
                                <FormField name="homepage_discover_title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} placeholder="Discover The World of Georgia With Us!" /></FormControl><FormMessage /></FormItem>)} />
                                <FormField name="homepage_discover_description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} placeholder="Discover amazing places at exclusive deals Only with Us!" /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendDiscover({ title: "", description: "", image: "", hint: "" })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {discoverFields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 items-start p-4 border rounded-lg bg-secondary/50">
                                    <div className="flex-1 space-y-4">
                                        <FormField name={`homepage_discover_items.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField name={`homepage_discover_items.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField name={`homepage_discover_items.${index}.image`} render={({ field: formField }) => (
                                            <FormItem>
                                                <FormLabel>Image</FormLabel>
                                                <div className="flex items-center gap-2">
                                                    <Input placeholder="Image URL" {...formField} />
                                                    <Input type="file" className="hidden" id={`discover-upload-${index}`} onChange={e => handleFileUpload(e.target.files?.[0] || null, `homepage_discover_items.${index}.image`, index)} />
                                                    <Button asChild type="button" variant="outline"><label htmlFor={`discover-upload-${index}`}><Upload className="h-4 w-4" /></label></Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                         )} />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeDiscover(index)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                    </div>

                     <Separator />
                     
                    {/* Destinations Section */}
                     <div className="space-y-4">
                        <div className="flex justify-between items-start">
                             <div>
                                <FormLabel className="text-lg font-semibold">"Explore by Destination" Section</FormLabel>
                                <FormField name="homepage_destinations_title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} placeholder="Explore by Destination" /></FormControl><FormMessage /></FormItem>)} />
                                <FormField name="homepage_destinations_description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} placeholder="From the vibrant capital to the serene mountains..." /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendDestination({ name: "", description: "", image: "", hint: "" })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {destinationFields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 items-start p-4 border rounded-lg bg-secondary/50">
                                    <div className="flex-1 space-y-4">
                                        <FormField name={`homepage_destinations.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField name={`homepage_destinations.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField name={`homepage_destinations.${index}.image`} render={({ field: formField }) => (
                                            <FormItem>
                                                <FormLabel>Image</FormLabel>
                                                <div className="flex items-center gap-2">
                                                    <Input placeholder="Image URL" {...formField} />
                                                    <Input type="file" className="hidden" id={`destination-upload-${index}`} onChange={e => handleFileUpload(e.target.files?.[0] || null, `homepage_destinations.${index}.image`, index)} />
                                                    <Button asChild type="button" variant="outline"><label htmlFor={`destination-upload-${index}`}><Upload className="h-4 w-4" /></label></Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                         )} />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeDestination(index)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Offers Section */}
                    <div className="space-y-4">
                        <FormLabel className="text-lg font-semibold">Offers Banner</FormLabel>
                        <FormField name="homepage_offers_title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} placeholder="Don't Miss Our Special Offers!" /></FormControl><FormMessage /></FormItem>)} />
                        <FormField name="homepage_offers_description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} placeholder="Get up to 20% off on select tours this month..." /></FormControl><FormMessage /></FormItem>)} />
                    </div>

                    <Separator />

                     {/* Newsletter Section */}
                    <div className="space-y-4">
                        <FormLabel className="text-lg font-semibold">Newsletter Section</FormLabel>
                        <FormField name="homepage_newsletter_title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} placeholder="Subscribe to Our Newsletter" /></FormControl><FormMessage /></FormItem>)} />
                        <FormField name="homepage_newsletter_description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} placeholder="Get the latest news, updates, and special offers..." /></FormControl><FormMessage /></FormItem>)} />
                    </div>

                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={isSaving || isUploading}>
                        {(isSaving || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Homepage Settings
                    </Button>
                </CardFooter>
            </form>
        </Form>
    );
}
