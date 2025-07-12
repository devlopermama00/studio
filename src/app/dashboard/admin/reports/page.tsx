
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminReportsPage() {
    const { toast } = useToast();

    const handleExport = (reportType: string) => {
        toast({
            title: "Export Started",
            description: `Generating ${reportType} report... (This is a demo, no file will be downloaded)`,
        });
        // In a real app, you would trigger an API endpoint to generate and download the CSV.
        // For example:
        // window.location.href = `/api/admin/reports/export?type=${reportType}`;
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>User Reports</CardTitle>
                    <CardDescription>Export lists of users and providers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold">All Users</h3>
                            <p className="text-sm text-muted-foreground">Export a CSV of all registered users.</p>
                        </div>
                        <Button variant="outline" onClick={() => handleExport("all_users")}>
                            <Download className="mr-2 h-4 w-4" /> Export
                        </Button>
                    </div>
                     <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold">Providers List</h3>
                            <p className="text-sm text-muted-foreground">Export a CSV of all tour providers.</p>
                        </div>
                        <Button variant="outline" onClick={() => handleExport("providers")}>
                            <Download className="mr-2 h-4 w-4" /> Export
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Financial & Tour Reports</CardTitle>
                    <CardDescription>Export tour and financial data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold">All Tours</h3>
                            <p className="text-sm text-muted-foreground">Export a detailed CSV of all tours.</p>
                        </div>
                        <Button variant="outline" onClick={() => handleExport("all_tours")}>
                            <Download className="mr-2 h-4 w-4" /> Export
                        </Button>
                    </div>
                     <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold">Monthly Revenue</h3>
                            <p className="text-sm text-muted-foreground">Export revenue totals by month. (Feature unavailable)</p>
                        </div>
                        <Button variant="outline" onClick={() => handleExport("monthly_revenue")} disabled>
                            <Download className="mr-2 h-4 w-4" /> Export
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
