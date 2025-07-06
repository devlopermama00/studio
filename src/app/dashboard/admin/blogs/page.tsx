
"use client"

import Link from "next/link"
import { MoreHorizontal, Loader2, Edit, Trash2, PlusCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface PopulatedPost {
    _id: string;
    title: string;
    published: boolean;
    author: { name: string };
    category?: { name: string };
    createdAt: string;
    publishedAt?: string;
}

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState<PopulatedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/blogs');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [toast]);


  const handleDelete = async (postId: string) => {
    setIsDeleting(postId);
    try {
        const response = await fetch(`/api/admin/blogs/${postId}`, { method: 'DELETE' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete post.");
        }
        toast({ title: "Success", description: "Blog post deleted." });
        fetchPosts(); // Re-fetch to update the list
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Deletion Failed", description: errorMessage });
    } finally {
        setIsDeleting(null);
    }
  }

  const PostListSkeleton = () => (
      Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
          </TableRow>
      ))
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Blog Management</CardTitle>
                <CardDescription>Create, edit, and manage all blog posts.</CardDescription>
            </div>
            <Button asChild size="sm">
                <Link href="/dashboard/admin/blogs/add">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Post
                </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <PostListSkeleton /> : posts.length > 0 ? (
              posts.map(post => (
                <TableRow key={post._id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>
                    <Badge variant={post.published ? "default" : "secondary"} className={cn({"bg-green-500": post.published})}>
                        {post.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.author?.name || 'N/A'}</TableCell>
                   <TableCell>
                        {post.published && post.publishedAt 
                            ? format(new Date(post.publishedAt), "PPP") 
                            : `Created ${format(new Date(post.createdAt), "PPP")}`}
                    </TableCell>
                  <TableCell className="text-right">
                    {isDeleting === post._id ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <>
                        <Button asChild variant="ghost" size="icon">
                            <Link href={`/dashboard/admin/blogs/${post._id}/edit`}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>

                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete the post "{post.title}".</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(post._id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">No blog posts found.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
