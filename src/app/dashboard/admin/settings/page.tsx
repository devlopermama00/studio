
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
    const { toast } = useToast();

    const handleSave = (settingName: string) => {
        toast({
            title: "Setting Saved",
            description: `${settingName} settings have been updated. (This is a demo)`,
        });
    };

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>General Site Settings</CardTitle>
                    <CardDescription>Manage global settings for your site. These are placeholders for now.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="logo">Logo Upload</Label>
                        <Input id="logo" type="file" disabled />
                        <p className="text-sm text-muted-foreground">Recommended size: 200x50px</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="primary-color">Primary Color</Label>
                            <Input id="primary-color" defaultValue="#21AEEB" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accent-color">Accent Color</Label>
                            <Input id="accent-color" defaultValue="#40BF9B" disabled />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button onClick={() => handleSave("General")} disabled>Save Changes</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Stripe API Credentials</CardTitle>
                    <CardDescription>Manage your payment gateway integration. Keys are read-only for security.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="stripe-pk">Publishable Key</Label>
                        <Input id="stripe-pk" value="pk_test_************************" readOnly />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="stripe-sk">Secret Key</Label>
                        <Input id="stripe-sk" value="sk_test_************************" readOnly />
                    </div>
                </CardContent>
                 <CardFooter className="border-t px-6 py-4">
                    <Button disabled>Update Credentials</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
