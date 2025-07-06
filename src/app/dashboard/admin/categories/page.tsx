
"use client"

import { MoreHorizontal, Loader2, PlusCircle, Trash2, Edit } from "lucide-react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Category {
    _id: string;
    name: string;
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState("");
    const { toast } = useToast();

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error("Failed to fetch categories");
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not load categories." });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [toast]);

    const handleEditClick = (category: Category) => {
        setCurrentCategory(category);
        setCategoryName(category.name);
        setIsDialogOpen(true);
    };

    const handleAddNewClick = () => {
        setCurrentCategory(null);
        setCategoryName("");
        setIsDialogOpen(true);
    };

    const handleDelete = async (categoryId: string) => {
        try {
            const response = await fetch(`/api/admin/categories/${categoryId}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete category");
            }
            toast({ title: "Success", description: "Category deleted." });
            fetchCategories();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Error", description: errorMessage });
        }
    };

    const handleDialogSubmit = async () => {
        if (!categoryName) {
            toast({ variant: "destructive", title: "Error", description: "Category name cannot be empty." });
            return;
        }
        setIsSubmitting(true);
        const url = currentCategory ? `/api/admin/categories/${currentCategory._id}` : '/api/admin/categories';
        const method = currentCategory ? 'PATCH' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: categoryName }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${currentCategory ? 'update' : 'create'} category`);
            }
            toast({ title: "Success", description: `Category ${currentCategory ? 'updated' : 'created'}.` });
            fetchCategories();
            setIsDialogOpen(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Error", description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const SkeletonRows = () => (
        Array.from({ length: 4 }).map((_, index) => (
            <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-8 w-20" /></TableCell>
            </TableRow>
        ))
    );

    return (
        <>
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Manage Categories</CardTitle>
                        <CardDescription>Add, edit, or delete tour categories.</CardDescription>
                    </div>
                    <Button onClick={handleAddNewClick}><PlusCircle className="mr-2 h-4 w-4" /> Add New</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <SkeletonRows /> : categories.length > 0 ? (
                            categories.map(category => (
                                <TableRow key={category._id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(category)}><Edit className="h-4 w-4" /></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete the "{category.name}" category. This action cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(category._id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center h-24">No categories found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{currentCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                    <DialogDescription>
                        {currentCategory ? `You are editing the "${currentCategory.name}" category.` : 'Create a new category for tours.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDialogSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {currentCategory ? 'Save Changes' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    )
}
