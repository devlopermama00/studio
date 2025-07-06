"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, User, Settings, LogOut,
  Map, FileText, BarChart2, ShieldCheck, Users, Edit, BookOpen
} from "lucide-react";
import { TourVistaLogo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "provider" | "admin";
  profilePhoto?: string;
}

const UserNav = () => {
    const pathname = usePathname();
    return (
        <SidebarGroup>
            <SidebarGroupLabel>My Account</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                        <Link href="/dashboard">
                            <LayoutDashboard />
                            Dashboard
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                     <SidebarMenuButton asChild isActive={pathname === "/dashboard/bookings"}>
                        <Link href="/dashboard/bookings">
                            <BookOpen />
                            My Bookings
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/profile"}>
                        <Link href="/dashboard/profile">
                            <User />
                            Profile
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
};

const ProviderNav = () => {
    const pathname = usePathname();
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Provider Tools</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/tours')}>
                        <Link href="/dashboard/tours">
                            <Map />
                            My Tours
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/analytics"}>
                        <Link href="/dashboard/analytics">
                            <BarChart2 />
                            Analytics
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/documents"}>
                        <Link href="/dashboard/documents">
                            <FileText />
                            Verification
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
};

const AdminNav = () => {
    const pathname = usePathname();
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/admin'}>
                        <Link href="/dashboard/admin">
                            <ShieldCheck />
                            Overview
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/admin/users')}>
                        <Link href="/dashboard/admin/users">
                            <Users />
                            Users
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/admin/tours')}>
                        <Link href="/dashboard/admin/tours">
                            <Edit />
                            Tours
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                     <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/admin/approvals')}>
                        <Link href="/dashboard/admin/approvals">
                            <ShieldCheck />
                            Approvals
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    )
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(true);
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          window.location.href = '/login';
        }
      } catch (error) {
        console.error("Failed to fetch user, redirecting to login", error);
        window.location.href = '/login';
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  if (isLoading) {
      return (
          <div className="flex min-h-screen">
              <div className="hidden md:flex flex-col p-2 space-y-2 bg-sidebar h-screen w-64 border-r border-sidebar-border">
                <div className="p-2"><Skeleton className="h-8 w-32 bg-sidebar-accent" /></div>
                <div className="flex-1 p-2 space-y-2">
                    <Skeleton className="h-8 w-full bg-sidebar-accent" />
                    <Skeleton className="h-8 w-full bg-sidebar-accent" />
                    <Skeleton className="h-8 w-full bg-sidebar-accent" />
                </div>
                <div className="p-2 space-y-2">
                    <Skeleton className="h-8 w-full bg-sidebar-accent" />
                    <Separator className="my-2 bg-sidebar-border" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-10 rounded-full bg-sidebar-accent" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-24 bg-sidebar-accent" />
                            <Skeleton className="h-3 w-32 bg-sidebar-accent" />
                        </div>
                    </div>
                </div>
              </div>
              <div className="flex-1 p-6 bg-secondary">
                <Skeleton className="h-8 w-48 mb-6 bg-background" />
                <Skeleton className="w-full h-96 bg-background" />
              </div>
          </div>
      )
  }

  if (!user) {
    return null; 
  }
  
  return (
    <SidebarProvider open={open} onOpenChange={setOpen} defaultOpen>
      <Sidebar>
        <SidebarHeader>
          <TourVistaLogo />
        </SidebarHeader>
        <SidebarContent className="p-2">
            <UserNav />
            {(user.role === 'provider' || user.role === 'admin') && <ProviderNav />}
            {user.role === 'admin' && <AdminNav />}
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"}>
                    <Link href="/dashboard/settings">
                        <Settings />
                        Settings
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                    <LogOut />
                    Logout
                </SidebarMenuButton>
            </SidebarMenuItem>
           </SidebarMenu>
           <Separator className="my-2 bg-sidebar-border" />
            <div className="p-2 flex items-center gap-2">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profilePhoto || ""} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="group-data-[collapsible=icon]:hidden transition-opacity duration-200">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-secondary">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />
            <h1 className="flex-1 text-xl font-headline font-semibold capitalize">
                {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
            </h1>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
