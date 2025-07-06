
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
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Trash2, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface Category {
    _id: string;
    name: string;
}

const itineraryItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
  location: z.string().min(2, { message: "Location is required." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  duration: z.string().min(2, { message: "Duration is required (e.g., '8 hours')." }),
  category: z.string({ required_error: "Please select a category." }),
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
      description: "",
      location: "",
      price: 0,
      duration: "",
      category: "",
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
        const response = await fetch(`/api/tours/${tourId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Failed to update tour.");
        }

        toast({ title: "Success!", description: "Tour has been updated." });
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
                <CardDescription>Update the details for this tour.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
            
             <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField name="location" render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="price" render={({ field }) => (<FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="duration" render={({ field }) => (<FormItem><FormLabel>Duration</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
             </div>
             
             <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>{categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
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
                        <div key={item.id} className="flex gap-4 items-start p-4 border rounded-lg">
                            <div className="flex-1 space-y-2">
                                <FormField name={`itinerary.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Stop Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField name={`itinerary.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Stop Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="mt-8 text-red-500" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
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
