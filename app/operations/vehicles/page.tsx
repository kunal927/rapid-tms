import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { getOperationsVehicles } from "@/lib/db/operations-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Car,
  Search,
  Filter,
  Truck,
  User,
  AlertTriangle,
  CheckCircle2,
  Wrench,
} from "lucide-react";
import Link from "next/link";

interface SearchParams {
  search?: string;
  status?: string;
}

export default async function OperationsVehiclesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAuth(["OPERATIONS_MANAGER", "SUPER_ADMIN"]);
  const params = await searchParams;

  const search = params.search ?? "";
  const status = params.status ?? "ALL";

  const vehicles = await getOperationsVehicles(search || undefined, status);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Fleet Vehicle Availability & Monitoring</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Real-time vehicle assignment status, live on-road tracking and maintenance readiness
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
                placeholder="Search vehicle number or model..."
                className="pl-8 h-9 text-xs"
              />
            </div>

            <select
              name="status"
              defaultValue={status}
              className="h-9 px-3 text-xs border rounded-lg bg-background text-foreground"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <Button type="submit" size="sm" variant="secondary" className="h-9 text-xs">
              <Filter className="h-3.5 w-3.5 mr-1" /> Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map(v => (
          <Card key={v.id} className="shadow-2xs border hover:border-foreground/20 transition-all">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-primary" />
                  <span className="font-bold text-sm">{v.vehicleNumber}</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    v.status === "AVAILABLE" ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10" :
                    v.status === "ON_TRIP" ? "border-purple-500/40 text-purple-700 dark:text-purple-300 bg-purple-500/10" :
                    v.status === "MAINTENANCE" ? "border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10" :
                    "border-red-500/40 text-red-700 dark:text-red-300 bg-red-500/10"
                  }`}
                >
                  {v.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{v.vehicleType} • Odometer: {v.currentKm} km</p>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2 text-xs border-t mt-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Trip:</span>
                <span className="font-semibold text-foreground">{v.currentTrip ?? "None (Idle)"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Driver:</span>
                <span className="font-semibold text-foreground">{v.currentDriver ?? "Unassigned"}</span>
              </div>
              {v.insuranceExpiry && (
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-muted-foreground">Insurance Expiry:</span>
                  <span>{new Date(v.insuranceExpiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                </div>
              )}

              <div className="pt-2 border-t flex justify-end">
                <Link href={`/admin/vehicles/${v.id}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-8 rounded-lg flex items-center justify-center gap-1.5 hover:bg-primary hover:text-primary-foreground">
                    <Wrench className="w-3.5 h-3.5" /> View Profile & Expenses
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
