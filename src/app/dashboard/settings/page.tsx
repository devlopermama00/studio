
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
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { uploadFile } from "@/services/fileUploader";

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
  bio: z.string().max(300, "Bio cannot be longer than 300 characters.").optional(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Must contain at least one number." })
    .regex(/[^A-Za-z0-9]/, { message: "Must contain at least one special character." }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});


const SettingsSkeleton = () => (
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


export default function SettingsPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const profileForm = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: { name: "", bio: "" },
    });

    const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/user/profile');
                if (!response.ok) throw new Error("Failed to fetch profile");
                const data = await response.json();
                setUser(data);
                profileForm.reset({ name: data.name, bio: data.bio || "" });
                setPreviewUrl(data.profilePhoto || null);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Could not load your profile." });
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [profileForm, toast]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    
    async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
        if (!user) return;
        setIsSaving(true);
        try {
            let photoUrl = user.profilePhoto;

            if (selectedFile) {
                photoUrl = await uploadFile(selectedFile, `profile-photos/${user._id}`);
            }

            const payload = { ...values, profilePhoto: photoUrl };

            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to update profile");
            
            setUser(data);
            setPreviewUrl(data.profilePhoto || null);
            setSelectedFile(null);
            toast({ title: "Success", description: "Your profile has been updated." });
            window.location.reload();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Update Failed", description: errorMessage });
        } finally {
            setIsSaving(false);
        }
    }
    
     async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
        setIsSavingPassword(true);
        try {
            const response = await fetch('/api/user/change-password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to update password.");

            toast({ title: "Success", description: "Your password has been changed." });
            passwordForm.reset();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Update Failed", description: errorMessage });
        } finally {
            setIsSavingPassword(false);
        }
    }
    
    if (isLoading) {
        return <SettingsSkeleton />;
    }

    if (!user) {
        return <div>Could not load profile.</div>;
    }

  return (
    <div className="grid gap-6">
      <Card>
        <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your personal details and profile picture.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={previewUrl || user.profilePhoto || ""} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-2 w-full">
                            <Input id="picture" type="file" onChange={handleFileChange} ref={fileInputRef} />
                            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                        </div>
                        </div>
                         <div className="grid sm:grid-cols-2 gap-4">
                            <FormField
                                control={profileForm.control}
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
                            control={profileForm.control}
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
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password for better security.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={isSavingPassword}>
                    {isSavingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                </Button>
                </CardFooter>
            </form>
        </Form>
      </Card>
    </div>
  );
}
