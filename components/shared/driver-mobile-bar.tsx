"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Truck,
  Package,
  Wallet,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DriverMobileBar() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Home",
      href: "/driver/dashboard",
      icon: Home,
    },
    {
      title: "Trip",
      href: "/driver/trip",
      icon: Truck,
    },
    {
      title: "Orders",
      href: "/driver/orders",
      icon: Package,
    },
    {
      title: "Earnings",
      href: "/driver/earnings",
      icon: Wallet,
    },
    {
      title: "Profile",
      href: "/driver/profile",
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t px-2 py-1 shadow-lg md:hidden">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/driver/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 px-3 min-w-[56px] min-h-[48px] rounded-lg transition-colors relative touch-manipulation active:scale-95",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
              </div>
              <span className="text-[10px] mt-1 tracking-tight font-medium">
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
