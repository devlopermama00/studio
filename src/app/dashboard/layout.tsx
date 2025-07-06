"use client";

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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, User, Settings, LogOut, LifeBuoy, CreditCard, Star, Map,
  FileText, BarChart2, ShieldCheck, Users, Edit, BookOpen
} from "lucide-react";
import { TourVistaLogo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import React from "react";

// Mock user role
const userRole: "user" | "provider" | "admin" = "admin";

const UserNav = () => (
  <SidebarGroup>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton href="/dashboard" isActive={usePathname() === "/dashboard"}>
          <LayoutDashboard />
          Dashboard
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton href="/dashboard/bookings" isActive={usePathname() === "/dashboard/bookings"}>
          <BookOpen />
          My Bookings
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton href="/dashboard/profile" isActive={usePathname() === "/dashboard/profile"}>
          <User />
          Profile
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
);

const ProviderNav = () => (
  <SidebarGroup>
    <SidebarGroupLabel>Provider Tools</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton href="/dashboard/tours" isActive={usePathname().startsWith('/dashboard/tours')}>
          <Map />
          My Tours
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton href="/dashboard/analytics" isActive={usePathname() === "/dashboard/analytics"}>
          <BarChart2 />
          Analytics
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton href="/dashboard/documents" isActive={usePathname() === "/dashboard/documents"}>
          <FileText />
          Verification
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
);

const AdminNav = () => {
    const pathname = usePathname();
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton href="/dashboard/admin" isActive={pathname === '/dashboard/admin'}>
                        <ShieldCheck />
                        Overview
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton href="/dashboard/admin/users" isActive={pathname.startsWith('/dashboard/admin/users')}>
                        <Users />
                        Users
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton href="/dashboard/admin/tours" isActive={pathname.startsWith('/dashboard/admin/tours')}>
                        <Edit />
                        Tours
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton href="/dashboard/admin/approvals" isActive={pathname.startsWith('/dashboard/admin/approvals')}>
                        <ShieldCheck />
                        Approvals
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    )
};


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(true);
  
  return (
    <SidebarProvider open={open} onOpenChange={setOpen} defaultOpen>
      <Sidebar>
        <SidebarHeader>
          <TourVistaLogo />
        </SidebarHeader>
        <SidebarContent className="p-2">
            <UserNav />
            {(userRole === 'provider' || userRole === 'admin') && <ProviderNav />}
            {userRole === 'admin' && <AdminNav />}
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton href="/dashboard/settings">
                    <Settings />
                    Settings
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton>
                    <LogOut />
                    Logout
                </SidebarMenuButton>
            </SidebarMenuItem>
           </SidebarMenu>
           <Separator className="my-2" />
            <div className="p-2 flex items-center gap-2">
                <Avatar className="h-10 w-10">
                    <AvatarImage src="https://placehold.co/100x100.png" />
                    <AvatarFallback>AU</AvatarFallback>
                </Avatar>
                <div className="group-data-[collapsible=icon]:hidden transition-opacity duration-200">
                    <p className="font-semibold">Admin User</p>
                    <p className="text-xs text-muted-foreground">admin@tourvista.com</p>
                </div>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-secondary">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-2xl font-headline font-semibold capitalize">
                {pathname.split('/').pop()?.replace('-', ' ')}
            </h1>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
