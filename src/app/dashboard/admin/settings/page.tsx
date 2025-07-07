
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneralSettingsForm } from "./_components/general-settings-form";
import { HomepageSettingsForm } from "./_components/homepage-settings-form";

export default function AdminSettingsPage() {
    return (
        <Tabs defaultValue="general">
            <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="homepage">Homepage</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>General Site Settings</CardTitle>
                        <CardDescription>Manage global settings for your site's appearance and identity.</CardDescription>
                    </CardHeader>
                    <GeneralSettingsForm />
                </Card>
            </TabsContent>
            <TabsContent value="homepage" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Homepage Content</CardTitle>
                        <CardDescription>Customize the sections displayed on your main landing page.</CardDescription>
                    </CardHeader>
                    <HomepageSettingsForm />
                </Card>
            </TabsContent>
        </Tabs>
    );
}
