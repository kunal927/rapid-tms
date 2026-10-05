import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { getOperationsDrivers } from "@/lib/db/operations-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Filter,
  Car,
  Truck,
  Phone,
  Package,
} from "lucide-react";
import Link from "next/link";

interface SearchParams {
  search?: string;
  status?: string;
}

export default async function OperationsDriversPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAuth(["OPERATIONS_MANAGER", "SUPER_ADMIN"]);
  const params = await searchParams;

  const search = params.search ?? "";
  const status = params.status ?? "ALL";

  const drivers = await getOperationsDrivers(search || undefined, status);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Driver Resource Monitoring</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Track driver duty status, current route assignments, and today's delivery counts (Operational View)
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="shadow-2xs">
        <CardContent className="p-3.5">
          <form method="GET" className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                name="search"
                defaultValue={search}
                placeholder="Search driver name, phone, code..."
                className="pl-8 h-9 text-xs"
              />
            </div>

            <select
              name="status"
              defaultValue={status}
              className="h-9 px-3 text-xs border rounded-lg bg-background text-foreground"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active / Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            <Button type="submit" size="sm" variant="secondary" className="h-9 text-xs">
              <Filter className="h-3.5 w-3.5 mr-1" /> Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map(d => (
          <Card key={d.id} className="shadow-2xs border hover:border-foreground/20 transition-all">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{d.name}</h3>
                  <p className="text-[11px] text-muted-foreground">Code: {d.driverCode}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    d.status === "ACTIVE" ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10" :
                    d.status === "ON_TRIP" ? "border-purple-500/40 text-purple-700 dark:text-purple-300 bg-purple-500/10" :
                    "border-red-500/40 text-red-700 dark:text-red-300 bg-red-500/10"
                  }`}
                >
                  {d.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2.5 text-xs border-t mt-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-primary" /> Mobile:
                </span>
                <span className="font-semibold text-foreground">{d.phone ?? "N/A"}</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Car className="h-3.5 w-3.5 text-blue-500" /> Current Vehicle:
                </span>
                <span className="font-semibold text-foreground">{d.currentVehicle ?? "None (Idle)"}</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-amber-500" /> Active Trip:
                </span>
                <span className="font-semibold text-foreground">{d.currentTrip ?? "None"}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 pt-2 border-t text-center">
                <div className="rounded-lg bg-muted/40 p-1.5">
                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">Orders</p>
                  <p className="font-bold text-xs">{d.todayOrders}</p>
                </div>
                <div className="rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-1.5">
                  <p className="text-[9px] uppercase font-semibold">Delivered</p>
                  <p className="font-bold text-xs">{d.deliveredOrders}</p>
                </div>
                <div className="rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 p-1.5">
                  <p className="text-[9px] uppercase font-semibold">Pending</p>
                  <p className="font-bold text-xs">{d.pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
