
"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import RichTextEditor from "@/components/rich-text-editor";

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

const EditPostSkeleton = () => (
    <Card>
        <CardHeader><Skeleton className="h-8 w-64" /></CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-24 w-full" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            </div>
        </CardContent>
        <CardFooter><Skeleton className="h-10 w-32" /></CardFooter>
    </Card>
)

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchPostAndCategories = async () => {
        try {
            const [postRes, catRes] = await Promise.all([
                fetch(`/api/admin/blogs/${postId}`),
                fetch('/api/categories')
            ]);

            if (!postRes.ok) throw new Error('Failed to fetch blog post data');
            const postData = await postRes.json();
            form.reset({
                ...postData,
                category: postData.category?._id || postData.category,
                tags: Array.isArray(postData.tags) ? postData.tags.join(', ') : '',
            });

            if (!catRes.ok) throw new Error('Failed to fetch categories');
            const catData = await catRes.json();
            setCategories(catData);

        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not load post data." });
        } finally {
            setIsFetchingData(false);
        }
    };
    fetchPostAndCategories();
  }, [postId, form, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
        const payload = {
            ...values,
            tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
            publishedAt: values.published ? new Date() : null,
        };

        const response = await fetch(`/api/admin/blogs/${postId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Failed to update post.");
        }

        toast({ title: "Success!", description: "Blog post has been updated." });
        router.push('/dashboard/admin/blogs');
        router.refresh();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Update Failed", description: errorMessage });
    } finally {
        setIsLoading(false);
    }
  }

  if (isFetchingData) {
      return <EditPostSkeleton />
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
                <CardTitle>Edit Blog Post</CardTitle>
                <CardDescription>Update the details for this post.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField name="content" render={({ field }) => (<FormItem><FormLabel>Content</FormLabel><FormControl><RichTextEditor value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
            
             <div className="grid sm:grid-cols-2 gap-4">
                 <FormField
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                            <SelectContent>{categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField name="tags" render={({ field }) => (<FormItem><FormLabel>Tags (comma-separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
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
