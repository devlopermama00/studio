
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface Notice {
    _id: string;
    title: string;
    content: string;
    target: 'provider' | 'user' | 'all';
    author: { name: string };
    createdAt: string;
}

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  target: z.enum(["provider", "user", "all"], { required_error: "Please select a target audience." }),
});

export default function AdminNoticesPage() {
    const { toast } = useToast();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchNotices = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/notices');
            if (!response.ok) throw new Error("Failed to fetch notices");
            const data = await response.json();
            setNotices(data);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not load notices." });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchNotices();
    }, [toast]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { title: "", content: "", target: "provider" },
    });
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/admin/notices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to create notice.");
            }
            toast({ title: "Success", description: "Notice posted successfully." });
            form.reset();
            fetchNotices();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Error", description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const handleDelete = async (noticeId: string) => {
        try {
            const response = await fetch(`/api/admin/notices/${noticeId}`, { method: 'DELETE' });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to delete notice.");
            }
            toast({ title: "Success", description: "Notice deleted." });
            setNotices(notices.filter(n => n._id !== noticeId));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Error", description: errorMessage });
        }
    };
    
    const SkeletonRows = () => Array.from({ length: 2 }).map((_, index) => (
        <TableRow key={index}>
            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </TableRow>
    ));

    return (
        <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Post a New Notice</CardTitle>
                        <CardDescription>Create an announcement for users or providers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Important Update" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField name="content" render={({ field }) => (<FormItem><FormLabel>Content</FormLabel><FormControl><Textarea placeholder="Details about the announcement..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="target" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Audience</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select an audience" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="provider">Providers</SelectItem>
                                                <SelectItem value="user">Users</SelectItem>
                                                <SelectItem value="all">All</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Post Notice
                                </Button>
                            </form>
                         </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3">
                 <Card>
                    <CardHeader>
                        <CardTitle>Posted Notices</CardTitle>
                        <CardDescription>A list of all past announcements.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Audience</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? <SkeletonRows /> : notices.map(notice => (
                                    <TableRow key={notice._id}>
                                        <TableCell className="font-medium">{notice.title}</TableCell>
                                        <TableCell className="capitalize">{notice.target}</TableCell>
                                        <TableCell>{format(new Date(notice.createdAt), "PPP")}</TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently delete the notice "{notice.title}".</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(notice._id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
