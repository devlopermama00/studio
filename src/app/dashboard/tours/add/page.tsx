
"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { v4 as uuidv4 } from 'uuid';


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Trash2, PlusCircle, X, CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { currencies } from "@/context/currency-context";
import { uploadFile } from "@/services/fileUploader";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useSocket } from "@/lib/socket";

interface Category {
    id: string;
    name: string;
}

interface ImagePreview {
    id: string;
    url: string;
    file: File;
}

const itineraryItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(5, { message: "Tour name must be at least 5 characters." }),
  country: z.string().min(2, { message: "Country is required." }).default("Georgia"),
  city: z.string().min(2, { message: "City is required." }),
  place: z.string().min(2, { message: "Place is required." }),
  durationInHours: z.coerce.number().positive({ message: "Duration must be a positive number of hours." }),
  currency: z.string({ required_error: "Currency is required." }).default("USD"),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  discountPrice: z.coerce.number().optional(),
  offerExpiresAt: z.date().optional(),
  tourType: z.enum(["public", "private"], { required_error: "Please select a tour type." }),
  category: z.string({ required_error: "Please select a category." }),
  groupSize: z.coerce.number().min(1, { message: "Group size must be at least 1." }),
  overview: z.string().min(50, { message: "Overview must be at least 50 characters." }),
  images: z
    .any()
    .refine((files) => files && files.length >= 1, "Images are required.")
    .refine((files) => files && files.length >= 3, "Minimum of 3 images is required.")
    .refine(
      (files) => files && Array.from(files).every((file: any) => file.size <= MAX_FILE_SIZE),
      `Max file size is 5MB.`
    )
    .refine(
      (files) => files && Array.from(files).every((file: any) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  languages: z.string().min(3, { message: "Please list at least one language." }),
  highlights: z.string().min(10, { message: "Please list at least one highlight." }),
  inclusions: z.string().min(10, { message: "Please list at least one inclusion." }),
  exclusions: z.string().min(10, { message: "Please list at least one exclusion." }),
  importantInformation: z.string().optional(),
  itinerary: z.array(itineraryItemSchema).optional(),
}).refine(data => {
    if (data.discountPrice && data.price) {
        return data.discountPrice < data.price;
    }
    return true;
}, {
    message: "Discount price must be less than the original price.",
    path: ["discountPrice"],
}).refine(data => {
    if (data.discountPrice) {
        return !!data.offerExpiresAt;
    }
    return true;
}, {
    message: "Offer expiry date is required when a discount is set.",
    path: ["offerExpiresAt"],
});

type TourFormValues = z.infer<typeof formSchema>;


export default function AddTourPage() {
  const router = useRouter();
  const { toast } = useToast();
  const socket = useSocket();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);

  const form = useForm<TourFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      country: "Georgia",
      city: "",
      place: "",
      durationInHours: 8,
      currency: "USD",
      price: 0,
      tourType: "public",
      category: "",
      groupSize: 1,
      overview: "",
      languages: "English\nGeorgian",
      highlights: "",
      inclusions: "",
      exclusions: "",
      importantInformation: "",
      itinerary: [],
      images: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "itinerary",
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews: ImagePreview[] = files.map(file => ({
        id: uuidv4(),
        url: URL.createObjectURL(file),
        file,
    }));
    
    const existingPreviews = imagePreviews;
    const combinedPreviews = [...existingPreviews, ...newPreviews];
    setImagePreviews(combinedPreviews);

    const dataTransfer = new DataTransfer();
    combinedPreviews.forEach(p => dataTransfer.items.add(p.file));
    form.setValue("images", dataTransfer.files, { shouldValidate: true });
  }

  const removeImage = (idToRemove: string) => {
    const newPreviews = imagePreviews.filter(p => p.id !== idToRemove);
    setImagePreviews(newPreviews);
    
    const dataTransfer = new DataTransfer();
    newPreviews.forEach(p => dataTransfer.items.add(p.file));
    form.setValue("images", dataTransfer.files, { shouldValidate: true });
  }

  useEffect(() => {
    return () => {
        imagePreviews.forEach(p => URL.revokeObjectURL(p.url));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not load categories. Please try again later.",
            });
        } finally {
            setIsFetchingCategories(false);
        }
    };
    fetchCategories();
  }, [toast]);

  async function onSubmit(values: TourFormValues) {
    setIsLoading(true);
    try {
        const imageFiles = Array.from(values.images);
        const imageUrls = await Promise.all(
            imageFiles.map(file => uploadFile(file, 'tour-images'))
        );

        const payload = {
            ...values,
            images: imageUrls,
            languages: values.languages.split('\n').map(item => item.trim()).filter(Boolean),
            highlights: values.highlights.split('\n').map(item => item.trim()).filter(Boolean),
            inclusions: values.inclusions.split('\n').map(item => item.trim()).filter(Boolean),
            exclusions: values.exclusions.split('\n').map(item => item.trim()).filter(Boolean),
        };

        const response = await fetch('/api/tours', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to create tour.");
        }

        if (socket) {
          socket.emit('broadcast', { event: 'tour_created', payload: data });
        }

        toast({
            title: "Success!",
            description: "Your new tour has been created and is pending approval.",
        });
        router.push('/dashboard/tours');
        router.refresh();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
            variant: "destructive",
            title: "Failed to create tour",
            description: errorMessage,
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
             <Button asChild variant="outline" size="icon">
                <Link href="/dashboard/tours">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to tours</span>
                </Link>
            </Button>
            <div>
                <CardTitle>Create a New Tour</CardTitle>
                <CardDescription>Fill out the details below to add a new tour to your listings.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField name="title" render={({ field }) => (<FormItem><FormLabel>Tour Name</FormLabel><FormControl><Input placeholder="e.g., Kazbegi Mountain Adventure" {...field} /></FormControl><FormMessage /></FormItem>)} />
            
            <div className="grid sm:grid-cols-3 gap-4">
                <FormField name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="e.g., Tbilisi" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="place" render={({ field }) => (<FormItem><FormLabel>Place / Area</FormLabel><FormControl><Input placeholder="e.g., Old Town" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            <FormField name="overview" render={({ field }) => (<FormItem><FormLabel>Overview of Tour</FormLabel><FormControl><Textarea placeholder="Describe the tour experience, what makes it unique, etc." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
            
            <div className="space-y-2">
                 <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tour Photos</FormLabel>
                        <FormControl>
                            <Input
                                type="file"
                                multiple
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                onChange={handleFileChange}
                            />
                        </FormControl>
                        <FormDescription>
                            Upload at least 3 photos. First image will be the cover. Max 5MB each.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        {imagePreviews.map((preview, index) => (
                            <div key={preview.id} className="relative group aspect-square">
                                <Image
                                    src={preview.url}
                                    alt={`Preview ${index + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className="rounded-md object-cover"
                                />
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImage(preview.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Separator />
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField name="durationInHours" render={({ field }) => (<FormItem><FormLabel>Duration (in hours)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="price" render={({ field }) => (<FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a currency" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.name} ({c.symbol})</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField name="groupSize" render={({ field }) => (<FormItem><FormLabel>Max Group Size</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            <Separator />
             <div>
                <h3 className="text-lg font-medium">Special Offer (Optional)</h3>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <FormField name="discountPrice" render={({ field }) => (<FormItem><FormLabel>Discounted Price</FormLabel><FormControl><Input type="number" placeholder="e.g., 45" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} value={field.value ?? ''} /></FormControl><FormDescription>Must be lower than the original price.</FormDescription><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="offerExpiresAt" render={({ field }) => (
                        <FormItem className="flex flex-col pt-2">
                            <FormLabel>Offer Expires On</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal h-10", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate()))} />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>
            <Separator />
            
             <div className="grid sm:grid-cols-2 gap-4 pt-4">
                 <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Category</FormLabel>
                    {isFetchingCategories ? <Skeleton className="h-10 w-full" /> : (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a tour category" /></SelectTrigger></FormControl>
                        <SelectContent>{categories.map(category => (<SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>))}</SelectContent>
                    </Select>
                    )}
                    <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="tourType" render={({ field }) => (
                    <FormItem><FormLabel>Tour Type</FormLabel><FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center h-10 space-x-4">
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="public" id="r_public" /></FormControl><FormLabel htmlFor="r_public" className="font-normal">Public</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="private" id="r_private" /></FormControl><FormLabel htmlFor="r_private" className="font-normal">Private</FormLabel></FormItem>
                        </RadioGroup>
                    </FormControl><FormMessage /></FormItem>
                )} />
             </div>

             <Separator />

             <div className="grid md:grid-cols-2 gap-6">
                 <FormField name="languages" render={({ field }) => (<FormItem><FormLabel>Available Languages</FormLabel><FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl><FormDescription>List each language on a new line.</FormDescription><FormMessage /></FormItem>)} />
                 <FormField name="highlights" render={({ field }) => (<FormItem><FormLabel>Highlights</FormLabel><FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl><FormDescription>List each highlight on a new line.</FormDescription><FormMessage /></FormItem>)} />
                 <FormField name="inclusions" render={({ field }) => (<FormItem><FormLabel>What's Included</FormLabel><FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl><FormDescription>List each inclusion on a new line.</FormDescription><FormMessage /></FormItem>)} />
                 <FormField name="exclusions" render={({ field }) => (<FormItem><FormLabel>What's Not Included</FormLabel><FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl><FormDescription>List each exclusion on a new line.</FormDescription><FormMessage /></FormItem>)} />
             </div>

             <FormField name="importantInformation" render={({ field }) => (<FormItem><FormLabel>Important Information</FormLabel><FormControl><Textarea placeholder="Any other important details for travelers..." {...field} /></FormControl><FormMessage /></FormItem>)} />
             
             <Separator />

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Itinerary</h3>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ title: "", description: "" })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </div>
                 <div className="space-y-4">
                    {fields.map((item, index) => (
                        <div key={item.id} className="flex gap-4 items-start p-4 border rounded-lg bg-secondary/50">
                            <div className="flex-1 space-y-2">
                                <FormField key={`title-${item.id}`} name={`itinerary.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Stop Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField key={`description-${item.id}`} name={`itinerary.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Stop Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="mt-8 text-red-500" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {fields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No itinerary items added yet.</p>}
                </div>
            </div>

          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" disabled={isLoading || isFetchingCategories}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Tour
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

