
"use client"

import { MoreHorizontal, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface PopulatedUser {
    _id: string;
    name: string;
    email: string;
    profilePhoto?: string;
}

interface VerificationDocument {
    _id: string;
    userId: PopulatedUser;
    licenseUrl: string;
    idProofUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
}

export default function AdminApprovalsPage() {
    const [documents, setDocuments] = useState<VerificationDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/admin/documents');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch documents");
                }
                const data = await response.json();
                setDocuments(data);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({
                    variant: "destructive",
                    title: "Error fetching documents",
                    description: errorMessage,
                })
            } finally {
                setIsLoading(false);
            }
        };
        fetchDocuments();
    }, [toast]);

    const handleUpdateStatus = async (docId: string, status: 'approved' | 'rejected') => {
        setIsUpdating(docId);
        try {
            const response = await fetch(`/api/admin/documents/${docId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update document status');
            }
            const updatedDoc = await response.json();
            setDocuments(docs => docs.map(d => d._id === docId ? updatedDoc : d));
            toast({ title: "Success", description: `Provider application ${status}.` });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Update Failed", description: errorMessage });
        } finally {
            setIsUpdating(null);
        }
    };
    
    const SkeletonRows = () => (
        Array.from({ length: 3 }).map((_, index) => (
            <TableRow key={index}>
                <TableCell>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="grid gap-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                 <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
        ))
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Approvals</CardTitle>
        <CardDescription>
          Review and approve new provider applications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Submitted On</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <SkeletonRows /> : documents.length > 0 ? (
                documents.map(doc => (
                <TableRow key={doc._id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="hidden h-9 w-9 sm:flex">
                                <AvatarImage src={doc.userId.profilePhoto || "https://placehold.co/100x100.png"} alt={doc.userId.name} />
                                <AvatarFallback>{doc.userId.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-0.5">
                                <p className="font-medium">{doc.userId.name}</p>
                                <p className="text-xs text-muted-foreground">{doc.userId.email}</p>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>{format(new Date(doc.submittedAt), "PPP")}</TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                           <Button variant="link" asChild className="p-0 h-auto">
                                <a href={doc.licenseUrl} target="_blank" rel="noopener noreferrer">License</a>
                            </Button>
                             <Button variant="link" asChild className="p-0 h-auto">
                                <a href={doc.idProofUrl} target="_blank" rel="noopener noreferrer">ID Proof</a>
                            </Button>
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className={cn({
                            "text-amber-600 border-amber-600": doc.status === 'pending',
                            "text-green-600 border-green-600": doc.status === 'approved',
                            "text-red-600 border-red-600": doc.status === 'rejected',
                        })}>
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </Badge>
                    </TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isUpdating === doc._id}>
                            {isUpdating === doc._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {doc.status !== 'approved' && <DropdownMenuItem className="text-green-600" onClick={() => handleUpdateStatus(doc._id, 'approved')}>Approve</DropdownMenuItem>}
                        {doc.status !== 'rejected' && <DropdownMenuItem className="text-red-600" onClick={() => handleUpdateStatus(doc._id, 'rejected')}>Reject</DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
            ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No provider applications found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
