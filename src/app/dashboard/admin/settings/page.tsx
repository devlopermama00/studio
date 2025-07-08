
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneralSettingsForm } from "./_components/general-settings-form";
import { HomepageSettingsForm } from "./_components/homepage-settings-form";
import { DestinationsSettingsForm } from "./_components/destinations-settings-form";

export default function AdminSettingsPage() {
    return (
        <Tabs defaultValue="general">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="homepage">Homepage</TabsTrigger>
                <TabsTrigger value="destinations">Destinations</TabsTrigger>
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
            <TabsContent value="destinations" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Destinations Page</CardTitle>
                        <CardDescription>Manage the content for the main /destinations page.</CardDescription>
                    </CardHeader>
                    <DestinationsSettingsForm />
                </Card>
            </TabsContent>
        </Tabs>
    );
}
