
"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Trash2, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { currencies } from "@/context/currency-context";

interface Category {
    _id: string;
    name: string;
}

const itineraryItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

const formSchema = z.object({
  title: z.string().min(5, { message: "Tour name must be at least 5 characters." }),
  country: z.string().min(2, { message: "Country is required." }).default("Georgia"),
  city: z.string().min(2, { message: "City is required." }),
  place: z.string().min(2, { message: "Place is required." }),
  durationInHours: z.coerce.number().positive({ message: "Duration must be a positive number of hours." }),
  currency: z.string({ required_error: "Currency is required." }).default("USD"),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  tourType: z.enum(["public", "private"], { required_error: "Please select a tour type." }),
  category: z.string({ required_error: "Please select a category." }),
  groupSize: z.coerce.number().min(1, { message: "Group size must be at least 1." }),
  overview: z.string().min(50, { message: "Overview must be at least 50 characters." }),
  languages: z.string().min(3, { message: "Please list at least one language." }),
  highlights: z.string().min(10, { message: "Please list at least one highlight." }),
  inclusions: z.string().min(10, { message: "Please list at least one inclusion." }),
  exclusions: z.string().min(10, { message: "Please list at least one exclusion." }),
  importantInformation: z.string().optional(),
  itinerary: z.array(itineraryItemSchema).optional(),
});

type TourFormValues = z.infer<typeof formSchema>;

const EditTourSkeleton = () => (
    <Card>
        <CardHeader><Skeleton className="h-8 w-64" /></CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-24 w-full" /></div>
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            </div>
        </CardContent>
        <CardFooter><Skeleton className="h-10 w-32" /></CardFooter>
    </Card>
)

export default function EditTourPage() {
  const router = useRouter();
  const params = useParams();
  const tourId = params.id as string;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

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
      languages: "",
      highlights: "",
      inclusions: "",
      exclusions: "",
      importantInformation: "",
      itinerary: [],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "itinerary",
  });

  useEffect(() => {
    const fetchTourAndCategories = async () => {
        try {
            const [tourRes, catRes] = await Promise.all([
                fetch(`/api/tours/${tourId}`),
                fetch('/api/categories')
            ]);

            if (!tourRes.ok) throw new Error('Failed to fetch tour data');
            const tourData = await tourRes.json();
            form.reset({
                ...tourData,
                category: tourData.category?._id || tourData.category,
                languages: Array.isArray(tourData.languages) ? tourData.languages.join('\n') : '',
                highlights: Array.isArray(tourData.highlights) ? tourData.highlights.join('\n') : '',
                inclusions: Array.isArray(tourData.inclusions) ? tourData.inclusions.join('\n') : '',
                exclusions: Array.isArray(tourData.exclusions) ? tourData.exclusions.join('\n') : '',
            });

            if (!catRes.ok) throw new Error('Failed to fetch categories');
            const catData = await catRes.json();
            setCategories(catData);

        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not load tour data." });
        } finally {
            setIsFetchingData(false);
        }
    };
    fetchTourAndCategories();
  }, [tourId, form, toast]);

  async function onSubmit(values: TourFormValues) {
    setIsLoading(true);
    try {
        const payload = {
            ...values,
            languages: values.languages.split('\n').map(item => item.trim()).filter(Boolean),
            highlights: values.highlights.split('\n').map(item => item.trim()).filter(Boolean),
            inclusions: values.inclusions.split('\n').map(item => item.trim()).filter(Boolean),
            exclusions: values.exclusions.split('\n').map(item => item.trim()).filter(Boolean),
        };
        const response = await fetch(`/api/tours/${tourId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Failed to update tour.");
        }

        toast({ title: "Success!", description: "Tour has been updated and sent for re-approval." });
        router.push('/dashboard/tours');
        router.refresh();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Update Failed", description: errorMessage });
    } finally {
        setIsLoading(false);
    }
  }

  if (isFetchingData) {
      return <EditTourSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
             <Button asChild variant="outline" size="icon">
                <Link href="/dashboard/tours">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
                <CardTitle>Edit Tour</CardTitle>
                <CardDescription>Update the details for this tour. Submitting will require re-approval.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
           <CardContent className="space-y-6">
            <FormField name="title" render={({ field }) => (<FormItem><FormLabel>Tour Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            
            <div className="grid sm:grid-cols-3 gap-4">
                <FormField name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="place" render={({ field }) => (<FormItem><FormLabel>Place / Area</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            <FormField name="overview" render={({ field }) => (<FormItem><FormLabel>Overview of Tour</FormLabel><FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
            
            <div className="space-y-2">
                <Label>Upload Photos</Label>
                <Input type="file" multiple disabled />
                <FormDescription>Minimum 3 photos. Image uploads feature coming soon.</FormDescription>
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
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a currency" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField name="groupSize" render={({ field }) => (<FormItem><FormLabel>Max Group Size</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            
             <div className="grid sm:grid-cols-2 gap-4">
                 <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Category</FormLabel>
                    {isFetchingData ? <Skeleton className="h-10 w-full" /> : (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a tour category" /></SelectTrigger></FormControl>
                        <SelectContent>{categories.map(category => (<SelectItem key={category._id} value={category._id}>{category.name}</SelectItem>))}</SelectContent>
                    </Select>
                    )}
                    <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="tourType" render={({ field }) => (
                    <FormItem><FormLabel>Tour Type</FormLabel><FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center h-10 space-x-4">
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

             <FormField name="importantInformation" render={({ field }) => (<FormItem><FormLabel>Important Information</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
             
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
                                <FormField name={`itinerary.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Stop Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField name={`itinerary.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Stop Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
