"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@/lib/auth/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Truck,
  Car,
  Users,
  Building2,
  Receipt,
  Fuel,
  Clock,
  Package,
  CreditCard,
  BookOpen,
  BarChart3,
  Settings,
  Bell,
  Wrench,
  DollarSign,
  Upload,
  UserCog,
  ShieldCheck,
  ClipboardList,
  MapPin,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  children?: { title: string; href: string }[];
}

interface AppSidebarProps {
  role: Role;
}

const adminNavGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Fleet & Operations",
    items: [
      { title: "Vehicles", href: "/admin/vehicles", icon: Car },
      { title: "Drivers", href: "/admin/drivers", icon: Users },
      { title: "DPDs", href: "/admin/dpds", icon: Building2 },
      { title: "Trips", href: "/admin/trips", icon: Truck },
      { title: "Orders", href: "/admin/orders", icon: Package },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Driver Payments", href: "/admin/payments/driver", icon: CreditCard },
      { title: "Advances", href: "/admin/advances", icon: DollarSign },
      { title: "Expenses", href: "/admin/expenses", icon: Receipt },
      { title: "Driver Ledger", href: "/admin/ledger", icon: BookOpen },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Attendance", href: "/admin/attendance", icon: Clock },
      { title: "Fuel", href: "/admin/fuel", icon: Fuel },
      { title: "Maintenance", href: "/admin/maintenance", icon: Wrench },
    ],
  },
  {
    label: "Data & Reports",
    items: [
      { title: "Reports", href: "/admin/reports", icon: BarChart3 },
      { title: "Excel Import", href: "/admin/import", icon: Upload },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "User Management", href: "/admin/users", icon: UserCog },
      { title: "Notifications", href: "/admin/notifications", icon: Bell },
      { title: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
      { title: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

const operationsNavGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/operations/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Trip Board", href: "/operations/board", icon: ClipboardList },
      { title: "Trips", href: "/operations/trips", icon: Truck },
      { title: "Orders", href: "/operations/orders", icon: Package },
      { title: "Deliveries", href: "/operations/deliveries", icon: MapPin },
    ],
  },
  {
    label: "Fleet",
    items: [
      { title: "Vehicles", href: "/operations/vehicles", icon: Car },
      { title: "Drivers", href: "/operations/drivers", icon: Users },
      { title: "DPDs", href: "/operations/dpds", icon: Building2 },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "Attendance", href: "/operations/attendance", icon: Clock },
      { title: "Expenses", href: "/operations/expenses", icon: Receipt },
      { title: "Reports", href: "/operations/reports", icon: BarChart3 },
      { title: "Notifications", href: "/operations/notifications", icon: Bell },
    ],
  },
];

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const navGroups = role === "SUPER_ADMIN" ? adminNavGroups : operationsNavGroups;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border select-none">
      {/* Sidebar Header with Brand & Close Button */}
      <SidebarHeader className="border-b border-sidebar-border/80 p-3">
        <div className="flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Truck className="h-4 w-4" />
            </div>
            <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-bold tracking-tight text-sidebar-foreground truncate">
                RAPID TMS
              </span>
              <span className="text-[10px] text-sidebar-foreground/50 truncate">
                {role === "SUPER_ADMIN" ? "Admin Control" : "Operations Hub"}
              </span>
            </div>
          </div>
          <SidebarTrigger className="h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>

      {/* Sidebar Navigation Content */}
      <SidebarContent className="px-2 py-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-1">
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50 px-2 py-1 group-data-[collapsible=icon]:hidden">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin/dashboard" &&
                      item.href !== "/operations/dashboard" &&
                      pathname.startsWith(item.href));

                  return (
                    <SidebarMenuItem key={item.href} className="border-b border-white/10 pb-1 mb-1 last:border-b-0 last:pb-0 last:mb-0">
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "h-9 text-xs font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-xs hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </SidebarMenuButton>
                      {item.badge && (
                        <SidebarMenuBadge className="text-[10px] font-semibold bg-sidebar-accent text-sidebar-foreground/70">
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Sidebar Footer with Status and Collapse Button */}
      <SidebarFooter className="border-t border-sidebar-border/80 p-2 space-y-2">
        {/* Panel status badge (visible when expanded) */}
        <div className="px-2.5 py-1.5 rounded-lg bg-sidebar-accent/50 text-[11px] space-y-1 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between">
            <span className="text-sidebar-foreground/50">Panel</span>
            <span className="font-semibold text-sidebar-primary text-[10px]">
              {role === "SUPER_ADMIN" ? "Super Admin" : "Operations"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sidebar-foreground/50">Status</span>
            <span className="font-semibold text-emerald-400 text-[10px] flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Dedicated Collapsible Toggle Button */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => toggleSidebar()}
              tooltip={state === "collapsed" ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
              className="h-8 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent justify-center border border-sidebar-border/50"
            >
              {state === "collapsed" ? (
                <PanelLeft className="h-4 w-4 shrink-0 text-sidebar-primary" />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4 shrink-0" />
                  <span className="truncate">Collapse Sidebar</span>
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Hover & click edge rail */}
      <SidebarRail />
    </Sidebar>
  );
}
