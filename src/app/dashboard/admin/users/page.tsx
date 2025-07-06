
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
  CardFooter,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'provider' | 'admin';
  profilePhoto?: string;
  isBlocked: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
          toast({
            variant: "destructive",
            title: "Error fetching users",
            description: errorMessage,
          })
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleToggleBlock = async (user: User) => {
    setIsUpdating(user._id);
    try {
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !user.isBlocked }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user status');
      }

      const updatedUser = await response.json();
      setUsers(users.map(u => u._id === user._id ? { ...u, isBlocked: updatedUser.isBlocked } : u));
      toast({
        title: "Success",
        description: `User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Update Failed", description: errorMessage });
    } finally {
      setIsUpdating(null);
    }
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsAlertOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsUpdating(userToDelete._id);
    try {
        const response = await fetch(`/api/admin/users/${userToDelete._id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete user');
        }
        setUsers(users.filter(u => u._id !== userToDelete._id));
        toast({ title: "Success", description: "User deleted successfully." });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Deletion Failed", description: errorMessage });
    } finally {
        setIsUpdating(null);
        setIsAlertOpen(false);
        setUserToDelete(null);
    }
  };


  const UserListSkeleton = () => (
      Array.from({ length: 5 }).map((_, index) => (
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
            <TableCell>
                <Skeleton className="h-5 w-16" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <Skeleton className="h-5 w-20" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <Skeleton className="h-5 w-24" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-8 w-8" />
            </TableCell>
          </TableRow>
      ))
  );

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          View, manage, and moderate all user accounts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">
                Joined Date
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <UserListSkeleton /> : users.length > 0 ? (
                users.map(user => (
                    <TableRow key={user._id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="hidden h-9 w-9 sm:flex">
                                    <AvatarImage src={user.profilePhoto || "https://placehold.co/100x100.png"} alt={user.name} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-0.5">
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className="capitalize">{user.role}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                           <Badge variant={user.isBlocked ? "destructive" : "default"} className={cn({"bg-red-500": user.isBlocked, "bg-green-500": !user.isBlocked})}>
                                {user.isBlocked ? "Blocked" : "Active"}
                            </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{format(new Date(user.createdAt), "PPP")}</TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isUpdating === user._id}>
                               {isUpdating === user._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            {user.role !== 'admin' && (
                                <DropdownMenuItem onClick={() => handleToggleBlock(user)}>
                                    {user.isBlocked ? "Unblock User" : "Block User"}
                                </DropdownMenuItem>
                            )}
                            {user.role !== 'admin' && (
                                <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(user)}>Delete</DropdownMenuItem>
                            )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No users found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>{users.length}</strong> of <strong>{users.length}</strong> users
        </div>
      </CardFooter>
    </Card>
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account for "{userToDelete?.name}".
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isUpdating === userToDelete?._id}>
                {isUpdating === userToDelete?._id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
