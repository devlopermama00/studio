
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface VerificationDocument {
    _id: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
}

export default function DocumentsPage() {
    const [document, setDocument] = useState<VerificationDocument | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    
    useEffect(() => {
        const fetchDocumentStatus = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/documents');
                if (response.ok) {
                    const data = await response.json();
                    setDocument(data);
                } else if (response.status !== 404) {
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

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // NOTE: In a real app, you'd get files from the form and upload them.
            // Here, we just trigger the POST request which uses placeholders.
            const response = await fetch('/api/documents', { method: 'POST' });
             const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit documents.');
            }
            setDocument(data);
            toast({ title: "Success", description: "Documents submitted for verification." });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Submission Failed", description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const StatusDisplay = () => {
        if (isLoading) {
            return <Skeleton className="h-16 w-full" />
        }
        
        if (!document) {
            return null; // The form for submission will be visible
        }

        const { status } = document;
        const statusConfig = {
            approved: { icon: CheckCircle, color: 'text-green-500', text: 'Your documents are verified. You can now publish tours.' },
            pending: { icon: Clock, color: 'text-amber-500', text: 'Your documents are under review. This usually takes 2-3 business days.' },
            rejected: { icon: AlertCircle, color: 'text-red-500', text: 'Your documents were rejected. Please review the feedback and re-upload.' }
        };
        const currentStatus = statusConfig[status];
        const Icon = currentStatus.icon;

        return (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary">
                <Icon className={`h-6 w-6 ${currentStatus.color}`} />
                <div>
                    <p className="font-semibold">
                    Current Status: <span className={`capitalize font-bold ${currentStatus.color}`}>{status}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{currentStatus.text}</p>
                </div>
            </div>
        )
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Verification</CardTitle>
        <CardDescription>
          Upload the required documents to get your provider account verified.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <StatusDisplay />

        { !isLoading && !document && (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">To start creating tours, you need to get verified first. Please submit the required documents below. File uploads are simulated for this demo.</p>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="business-license" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Business License
                    </Label>
                    <Input id="business-license" type="file" disabled />
                    <p className="text-xs text-muted-foreground">PDF, JPG, or PNG. Max 5MB.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="id-proof" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        National ID / Passport
                    </Label>
                    <Input id="id-proof" type="file" disabled />
                    <p className="text-xs text-muted-foreground">PDF, JPG, or PNG. Max 5MB.</p>
                </div>
            </div>
            
            <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit for Verification
            </Button>
        </div>
        )}

        { !isLoading && document && document.status === 'rejected' && (
             <Button disabled>
                Re-submit Documents (coming soon)
            </Button>
        )}
      </CardContent>
    </Card>
  );
}
