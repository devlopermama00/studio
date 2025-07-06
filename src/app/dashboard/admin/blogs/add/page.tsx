
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
    _id: string;
    name: string;
}

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  content: z.string().min(50, { message: "Content must be at least 50 characters." }),
  category: z.string().optional(),
  tags: z.string().optional(),
  published: z.boolean().default(false),
});

export default function AddBlogPostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not load categories." });
        } finally {
            setIsFetchingCategories(false);
        }
    };
    fetchCategories();
  }, [toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      published: false,
      category: "",
      tags: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
        const payload = {
            ...values,
            tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
        };

        const response = await fetch('/api/admin/blogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Failed to create post.");
        }

        toast({ title: "Success!", description: "New blog post created." });
        router.push('/dashboard/admin/blogs');
        router.refresh();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Failed to create post", description: errorMessage });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
             <Button asChild variant="outline" size="icon">
                <Link href="/dashboard/admin/blogs">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
                <CardTitle>Create New Blog Post</CardTitle>
                <CardDescription>Fill out the form to create a new post.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Your amazing blog post title" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField 
                name="content" 
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                            <Textarea 
                                placeholder="Write your content here. You can use Markdown for formatting." 
                                className="min-h-[250px]"
                                {...field} 
                            />
                        </FormControl>
                         <FormDescription>
                            Supports Markdown for rich text formatting.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )} 
            />
            
             <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Category</FormLabel>
                        {isFetchingCategories ? <Skeleton className="h-10 w-full" /> : (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                            <SelectContent>{categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                        )}
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField name="tags" render={({ field }) => (<FormItem><FormLabel>Tags</FormLabel><FormControl><Input placeholder="georgia, travel, tbilisi" {...field} /></FormControl><FormMessage /></FormItem>)} />
             </div>
             
             <FormField
                name="published"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Publish Post</FormLabel>
                            <CardDescription>Make this post visible to the public.</CardDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                )}
            />
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" disabled={isLoading || isFetchingCategories}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Post
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
