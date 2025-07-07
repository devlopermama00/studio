
"use client"

import { MoreHorizontal, Loader2, UserX, UserCheck, KeyRound, Edit, Trash2, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'provider' | 'admin';
  profilePhoto?: string;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isResetAlertOpen, setIsResetAlertOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/users');
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
        // Initially, show all users and only verified providers.
        setFilteredUsers(data.filter((u: User) => u.role !== 'provider' || u.isVerified));
      } catch (error) {
          toast({ variant: "destructive", title: "Error fetching users", description: "Could not load user data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);

  const handleFilterChange = (role: string) => {
    let roleFiltered = users;
    if (role !== 'all') {
      roleFiltered = users.filter(user => user.role === role);
    }
    // Always apply the rule: only show verified providers from the role-filtered list.
    setFilteredUsers(roleFiltered.filter((u: User) => u.role !== 'provider' || u.isVerified));
  };

  const handleToggleBlock = async (user: User) => {
    setIsUpdating(user._id);
    try {
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !user.isBlocked }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user status');
      }
      
      const updatedUsers = users.map(u => u._id === user._id ? { ...u, isBlocked: data.isBlocked } : u);
      setUsers(updatedUsers);
      
      const currentFilter = document.querySelector('[role="combobox"]')?.textContent;
      if (currentFilter === "All Roles") {
        setFilteredUsers(updatedUsers.filter(u => u.role !== 'provider' || u.isVerified));
      } else {
        const role = currentFilter?.toLowerCase();
        setFilteredUsers(updatedUsers.filter(u => u.role === role && (u.role !== 'provider' || u.isVerified)));
      }
      
      toast({ title: "Success", description: `User ${user.isBlocked ? 'unblocked' : 'blocked'}.` });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ variant: "destructive", title: "Update Failed", description: errorMessage });
    } finally {
      setIsUpdating(null);
    }
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsAlertOpen(true);
  };

  const openResetDialog = (user: User) => {
    setUserToReset(user);
    setIsResetAlertOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsUpdating(userToDelete._id);
    try {
        const response = await fetch(`/api/admin/users/${userToDelete._id}`, { method: 'DELETE' });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete user');
        }
        
        const remainingUsers = users.filter(u => u._id !== userToDelete._id);
        setUsers(remainingUsers);
        setFilteredUsers(filteredUsers.filter(u => u._id !== userToDelete._id));

        toast({ title: "Success", description: "User deleted successfully." });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        toast({ variant: "destructive", title: "Deletion Failed", description: errorMessage });
    } finally {
        setIsUpdating(null);
        setIsAlertOpen(false);
        setUserToDelete(null);
    }
  };

  const handleConfirmResetPassword = async () => {
    if (!userToReset) return;
    setIsUpdating(userToReset._id);
    try {
        const response = await fetch(`/api/admin/users/${userToReset._id}/reset-password`, { method: 'POST' });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to send reset link.');
        }
        toast({ title: "Success", description: `Password reset link sent to ${userToReset.email}.` });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        toast({ variant: "destructive", title: "Action Failed", description: errorMessage });
    } finally {
        setIsUpdating(null);
        setIsResetAlertOpen(false);
        setUserToReset(null);
    }
  };


  const UserListSkeleton = () => (
      Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full" /><div className="grid gap-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-32" /></div></div></TableCell>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
          </TableRow>
      ))
  );

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View, manage, and moderate all user accounts. Unverified providers are managed in the Approvals tab.</CardDescription>
        <div className="pt-4">
            <Select onValueChange={handleFilterChange} defaultValue="all">
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="provider">Provider</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <UserListSkeleton /> : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                    <TableRow key={user._id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9"><AvatarImage src={user.profilePhoto || ""} alt={user.name} /><AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                                <div className="grid gap-0.5"><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div>
                            </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{user.role}</Badge></TableCell>
                        <TableCell>
                           <Badge variant={user.isBlocked ? "destructive" : "default"} className={cn({"bg-red-500": user.isBlocked, "bg-green-500": !user.isBlocked})}>
                                {user.isBlocked ? "Blocked" : "Active"}
                            </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(user.createdAt), "PPP")}</TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isUpdating === user._id}>
                               {isUpdating === user._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {user.role === 'provider' && (
                                  <DropdownMenuItem asChild>
                                      <Link href={`/dashboard/admin/provider-view/${user._id}`}>
                                          <LayoutDashboard className="mr-2 h-4 w-4" /> View Dashboard
                                      </Link>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/admin/users/${user._id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4"/> Edit User
                                    </Link>
                                </DropdownMenuItem>
                                {user.role !== 'admin' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleToggleBlock(user)}>
                                        {user.isBlocked ? (
                                            <><UserCheck className="mr-2 h-4 w-4"/>Unblock User</>
                                        ) : (
                                            <><UserX className="mr-2 h-4 w-4"/>Block User</>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openResetDialog(user)}>
                                      <KeyRound className="mr-2 h-4 w-4"/> Reset Password
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/40" onClick={() => openDeleteDialog(user)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete User
                                    </DropdownMenuItem>
                                  </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">No users found for this filter.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">Showing <strong>{filteredUsers.length}</strong> of <strong>{users.filter(u => u.role !== 'provider' || u.isVerified).length}</strong> users</div>
      </CardFooter>
    </Card>
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the user account for "{userToDelete?.name}" and all associated data.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isUpdating === userToDelete?._id} className="bg-destructive hover:bg-destructive/90">
                {isUpdating === userToDelete?._id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
     <AlertDialog open={isResetAlertOpen} onOpenChange={setIsResetAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Reset Password?</AlertDialogTitle>
            <AlertDialogDescription>This will send a password reset link to "{userToReset?.email}". The user will be able to set a new password. Are you sure?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmResetPassword} disabled={isUpdating === userToReset?._id}>
                {isUpdating === userToReset?._id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Link
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
