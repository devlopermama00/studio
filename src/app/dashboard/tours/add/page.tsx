
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

// Mock categories for now. We will fetch these from the API later.
const categories = [
  { id: "1", name: "City Tours" },
  { id: "2", name: "Mountain & Hiking" },
  { id: "3", name: "Wine & Gastronomy" },
  { id: "4", name: "Historical & Cultural" },
  { id: "5", name: "Multi-Day Tours" },
  { id: "6", name: "Adventure & Extreme" },
];

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
  location: z.string().min(2, { message: "Location is required." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  duration: z.string().min(2, { message: "Duration is required (e.g., '8 hours')." }),
  category: z.string({ required_error: "Please select a category." }),
});

export default function AddTourPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      price: 0,
      duration: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // This is where we'll call our API endpoint later.
    console.log(values);
    toast({
        title: "Tour Data (for now)",
        description: <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4"><code className="text-white">{JSON.stringify(values, null, 2)}</code></pre>
    });
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
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tour Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Kazbegi Mountain Adventure" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the tour experience, what's included, etc." className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Tbilisi" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Price (per person)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="95" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Full Day" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
             </div>
             <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a tour category" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {categories.map(category => (
                                <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <div>
                    <FormLabel>Tour Images</FormLabel>
                    <Input type="file" multiple disabled />
                    <FormDescription>Image uploads will be enabled soon.</FormDescription>
                 </div>
             </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Tour
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
