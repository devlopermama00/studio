
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Clock, FileWarning } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface VerificationDocument {
    _id: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    licenseUrl: string;
    idProofUrl: string;
}

export default function DocumentsPage() {
    const [document, setDocument] = useState<VerificationDocument | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    
    useEffect(() => {
        const fetchDocumentStatus = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/documents');
                if (response.ok) {
                    const data = await response.json();
                    setDocument(data);
                } else if (response.status !== 404 && response.status !== 200) { 
                     const errorData = await response.json();
                     throw new Error(errorData.message || 'Failed to fetch status');
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({ variant: "destructive", title: "Error", description: errorMessage });
            } finally {
                setIsLoading(false);
            }
        };
        fetchDocumentStatus();
    }, [toast]);
    
    const StatusDisplay = () => {
        if (!document) {
            return (
                 <Alert variant="destructive">
                    <FileWarning className="h-4 w-4" />
                    <AlertTitle>No Documents Found</AlertTitle>
                    <AlertDescription>
                        We could not find any verification documents associated with your account. This should have been created during registration. Please contact support for assistance.
                    </AlertDescription>
                </Alert>
            )
        }

        const { status } = document;
        const statusConfig = {
            approved: { icon: CheckCircle, color: 'text-green-500', text: 'Your documents are verified. You can now publish tours.' },
            pending: { icon: Clock, color: 'text-amber-500', text: 'Your documents are under review. This usually takes 2-3 business days.' },
            rejected: { icon: AlertCircle, color: 'text-red-500', text: 'Your documents were rejected. Please check your email for details and contact support if you have questions.' }
        };
        const currentStatus = statusConfig[status];
        const Icon = currentStatus.icon;

        return (
            <>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary">
                    <Icon className={`h-8 w-8 ${currentStatus.color}`} />
                    <div>
                        <p className="font-semibold">
                        Current Status: <span className={`capitalize font-bold ${currentStatus.color}`}>{status}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{currentStatus.text}</p>
                    </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Submitted Documents</h3>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <p className="text-sm font-medium">Company License</p>
                        <Button variant="secondary" size="sm" asChild>
                            <a href={document.licenseUrl} target="_blank" rel="noopener noreferrer">View Document</a>
                        </Button>
                    </div>
                     <div className="flex items-center justify-between p-3 border rounded-lg">
                        <p className="text-sm font-medium">National ID / Proof of ID</p>
                        <Button variant="secondary" size="sm" asChild>
                            <a href={document.idProofUrl} target="_blank" rel="noopener noreferrer">View Document</a>
                        </Button>
                    </div>
                </div>
            </>
        )
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Verification Status</CardTitle>
        <CardDescription>
          This page shows the status of your account verification and the documents you have submitted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-48 w-full" /> : <StatusDisplay />}
      </CardContent>
    </Card>
  );
}
