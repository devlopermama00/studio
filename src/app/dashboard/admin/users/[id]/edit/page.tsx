
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email(),
});

const EditUserSkeleton = () => (
    <Card>
        <CardHeader><Skeleton className="h-8 w-64" /></CardHeader>
        <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            </div>
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
        </CardContent>
        <CardFooter><Skeleton className="h-10 w-32" /></CardFooter>
    </Card>
);

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    }
  });

  useEffect(() => {
    const fetchUser = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`/api/admin/users/${userId}`);
            if (!res.ok) throw new Error('Failed to fetch user data');
            const userData = await res.json();
            form.reset(userData);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not load user data." });
        } finally {
            setIsFetchingData(false);
        }
    };
    fetchUser();
  }, [userId, form, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: values.name }), // Only send the name
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Failed to update user.");
        }

        toast({ title: "Success!", description: "User has been updated." });
        router.push('/dashboard/admin/users');
        router.refresh();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Update Failed", description: errorMessage });
    } finally {
        setIsLoading(false);
    }
  }

  if (isFetchingData) {
      return <EditUserSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
             <Button asChild variant="outline" size="icon">
                <Link href="/dashboard/admin/users">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
                <CardTitle>Edit User</CardTitle>
                <CardDescription>Update the details for this user.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
                <FormField name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled /></FormControl><FormMessage /></FormItem>)} />
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
