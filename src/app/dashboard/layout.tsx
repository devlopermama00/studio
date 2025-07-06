
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
  Map, FileText, BarChart2, ShieldCheck, Users, Edit, BookOpen, Heart,
  BookCopy, MessageSquare, LayoutList, Download, PenSquare, Star, DollarSign, Megaphone, Wallet
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

const UserNav = ({ user }: { user: AuthUser }) => {
    const pathname = usePathname();
    return (
        <SidebarGroup>
            <SidebarGroupLabel>My Account</SidebarGroupLabel>
            <SidebarMenu>
                {user.role !== 'admin' && (
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                            <Link href="/dashboard">
                                <LayoutDashboard />
                                Dashboard
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                     <SidebarMenuButton asChild isActive={pathname === "/dashboard/bookings"}>
                        <Link href="/dashboard/bookings">
                            <BookOpen />
                            My Bookings
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/wishlist"}>
                        <Link href="/dashboard/wishlist">
                            <Heart />
                            Wishlist
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/chat"}>
                        <Link href="/dashboard/chat">
                            <MessageSquare />
                            Support Chat
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
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/payouts"}>
                        <Link href="/dashboard/payouts">
                            <DollarSign />
                            Payout History
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/payout-settings"}>
                        <Link href="/dashboard/payout-settings">
                            <Wallet />
                            Payout Settings
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
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/admin' || pathname === '/dashboard'}>
                        <Link href="/dashboard/admin">
                            <LayoutDashboard />
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
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/admin/bookings')}>
                        <Link href="/dashboard/admin/bookings">
                            <BookCopy />
                            Bookings
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/admin/payouts')}>
                        <Link href="/dashboard/admin/payouts">
                            <DollarSign />
                            Payouts
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/admin/tours')}>
                        <Link href="/dashboard/admin/tours">
                            <Map />
                            Tours
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                     <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/admin/blogs')}>
                        <Link href="/dashboard/admin/blogs">
                            <PenSquare />
                            Blog
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
                 <SidebarMenuItem>
                     <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/admin/reviews')}>
                        <Link href="/dashboard/admin/reviews">
                            <Star />
                            Reviews
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                     <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/admin/notices')}>
                        <Link href="/dashboard/admin/notices">
                            <Megaphone />
                            Notices
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/chat')}>
                        <Link href="/dashboard/chat">
                            <MessageSquare />
                            Support Chat
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                     <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/admin/categories')}>
                        <Link href="/dashboard/admin/categories">
                            <LayoutList />
                            Categories
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                     <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/admin/reports')}>
                        <Link href="/dashboard/admin/reports">
                            <Download />
                            Reports
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                     <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/admin/settings')}>
                        <Link href="/dashboard/admin/settings">
                            <Settings />
                            Site Settings
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
  
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 1) {
        const lastSegment = segments[segments.length - 1];
        if (lastSegment === 'admin' && segments.length > 2) {
             const title = segments[segments.length - 2];
             return title === 'dashboard' ? 'Overview' : title.replace('-', ' ');
        }
        if (lastSegment.match(/^[0-9a-fA-F]{24}$/)) { // Check if it's a likely ObjectId
            return segments[segments.length - 2].replace('-', ' ');
        }
        return lastSegment.replace('-', ' ');
    }
    return user.role === 'admin' ? 'Overview' : 'Dashboard';
  }

  return (
    <SidebarProvider open={open} onOpenChange={setOpen} defaultOpen>
      <Sidebar>
        <SidebarHeader>
          <TourVistaLogo />
        </SidebarHeader>
        <SidebarContent className="p-2">
            {user.role === 'admin' ? <AdminNav /> : <UserNav user={user} />}
            {user.role === 'provider' && <ProviderNav />}
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
                {getPageTitle()}
            </h1>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
