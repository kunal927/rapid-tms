"use client";

import React from "react";
import { UserSession } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Truck,
  LogOut,
  Shield,
  Briefcase,
  User,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AppHeaderProps {
  user: UserSession;
  panelTitle: string;
}

export function AppHeader({ user, panelTitle }: AppHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        toast.success("Logged out successfully");
        router.push("/login");
        router.refresh();
      }
    } catch {
      toast.error("Error signing out");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <Badge className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1 text-xs">
            <Shield className="w-3 h-3" /> Super Admin
          </Badge>
        );
      case "OPERATIONS_MANAGER":
        return (
          <Badge className="bg-amber-600 text-white hover:bg-amber-700 flex items-center gap-1 text-xs">
            <Briefcase className="w-3 h-3" /> Ops Manager
          </Badge>
        );
      case "DRIVER":
        return (
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1 text-xs">
            <Truck className="w-3 h-3" /> Driver
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-9 w-9 -ml-1 text-muted-foreground hover:text-foreground hover:bg-muted" />
        <div className="h-5 w-px bg-border hidden sm:block" />
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-foreground">
                RAPID
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-widest">
                TMS
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              {panelTitle}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center">
          {getRoleBadge(user.role)}
        </div>

        {/* Notifications Icon */}
        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9 rounded-full border-border/60 hover:bg-muted"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-card" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-muted rounded-full cursor-pointer transition-colors outline-none border border-transparent hover:border-border">
            <Avatar className="h-8 w-8 border border-border">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-semibold text-foreground leading-none">
                {user.name}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {user.email}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden lg:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground leading-none">
                  {user.email}
                </p>
                <div className="pt-1.5">{getRoleBadge(user.role)}</div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-xs flex items-center gap-2">
              <User className="h-4 w-4" /> Profile & Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-xs text-destructive focus:text-destructive flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
