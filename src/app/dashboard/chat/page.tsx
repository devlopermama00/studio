
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MessageSquareOff /> Chat Feature Removed</CardTitle>
        <CardDescription>This feature is no longer available.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">The chat functionality has been removed from the application.</p>
        <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
