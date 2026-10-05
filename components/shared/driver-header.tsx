"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserSession } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Truck,
  Bell,
  Menu,
  Receipt,
  CreditCard,
  BookOpen,
  CalendarCheck,
  History,
  Car,
  User,
  PhoneCall,
  LogOut,
  Home,
  Package,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

interface DriverHeaderProps {
  user: UserSession;
  driverName?: string;
  driverCode?: string;
}

export function DriverHeader({ user, driverName, driverCode }: DriverHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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

  const menuItems = [
    { title: "Dashboard", href: "/driver/dashboard", icon: Home },
    { title: "Current Active Trip", href: "/driver/trip", icon: Truck },
    { title: "My Orders & Consignments", href: "/driver/orders", icon: Package },
    { title: "Daily Attendance & Clock-In", href: "/driver/attendance", icon: CalendarCheck },
    { title: "Trip Expenses & Tolls", href: "/driver/expenses", icon: Receipt },
    { title: "Cash Advances", href: "/driver/advance", icon: CreditCard },
    { title: "My Earnings", href: "/driver/earnings", icon: Wallet },
    { title: "Driver Ledger", href: "/driver/ledger", icon: BookOpen },
    { title: "Trip History", href: "/driver/trips", icon: History },
    { title: "Assigned Vehicle", href: "/driver/vehicle", icon: Car },
    { title: "My Profile", href: "/driver/profile", icon: User },
    { title: "Notifications", href: "/driver/notifications", icon: Bell },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/95 backdrop-blur-md px-3 sm:px-4 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg touch-manipulation">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col">
            <SheetHeader className="p-4 border-b bg-muted/30 text-left">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border-2 border-primary/20">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-sm font-bold text-foreground">
                    {driverName || user.name}
                  </SheetTitle>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {driverCode ? `Code: ${driverCode}` : user.email}
                  </p>
                  <Badge className="bg-emerald-600 text-white text-[10px] h-4 mt-1 px-1.5 font-semibold">
                    <Truck className="w-2.5 h-2.5 mr-1" /> Active Fleet Driver
                  </Badge>
                </div>
              </div>
            </SheetHeader>

            {/* Menu Links */}
            <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 text-xs">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-foreground/80 hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}

              <div className="pt-2 border-t mt-2">
                <a
                  href="tel:+919811122334"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold"
                >
                  <PhoneCall className="h-4 w-4 shrink-0" />
                  <span>Depot SOS / Emergency Call</span>
                </a>
              </div>
            </div>

            <div className="p-3 border-t bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full text-destructive hover:text-destructive flex items-center justify-center gap-2 h-9"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-2xs">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-foreground">RAPID</span>
            <span className="ml-1 text-[9px] font-bold px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase">
              Driver
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Link href="/driver/notifications">
          <Button variant="ghost" size="icon" className="h-8 w-8 relative rounded-full">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-card" />
            <span className="sr-only">Notifications</span>
          </Button>
        </Link>

        <Link href="/driver/profile">
          <Avatar className="h-8 w-8 border border-border cursor-pointer">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
