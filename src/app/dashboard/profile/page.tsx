
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  profilePhoto?: string;
}

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  bio: z.string().max(300, { message: "Bio cannot be longer than 300 characters." }).optional(),
});

const ProfileSkeleton = () => (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your personal details and profile picture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="grid gap-2 w-full">
                         <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Bio</Label>
                    <Skeleton className="h-24 w-full" />
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Skeleton className="h-10 w-24" />
            </CardFooter>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password for better security.</CardDescription>
            </CardHeader>
             <CardContent>
                <Skeleton className="h-32 w-full" />
             </CardContent>
             <CardFooter className="border-t px-6 py-4">
                <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
    </div>
);


export default function ProfilePage() {
    const { toast } = useToast();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: { name: "", bio: "" },
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/user/profile');
                if (!response.ok) throw new Error("Failed to fetch profile");
                const data = await response.json();
                setUser(data);
                form.reset({ name: data.name, bio: data.bio || "" });
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Could not load your profile." });
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [form, toast]);
    
    async function onSubmit(values: z.infer<typeof profileFormSchema>) {
        setIsSaving(true);
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to update profile");
            
            setUser(data);
            toast({ title: "Success", description: "Your profile has been updated." });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Update Failed", description: errorMessage });
        } finally {
            setIsSaving(false);
        }
    }
    
    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (!user) {
        return <div>Could not load profile.</div>;
    }

  return (
    <div className="grid gap-6">
      <Card>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your personal details and profile picture.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.profilePhoto || ""} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-2 w-full">
                            <Input id="picture" type="file" disabled />
                            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max. (Feature coming soon)</p>
                        </div>
                        </div>
                         <div className="grid sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={user.email} disabled />
                            </div>
                        </div>
                         <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Tell us a little about yourself" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
                </CardFooter>
            </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password for better security. (Feature coming soon)</CardDescription>
        </CardHeader>
        <CardContent>
        <form className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" disabled />
            </div>
            <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" disabled />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" disabled />
            </div>
        </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button disabled>Update Password</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
