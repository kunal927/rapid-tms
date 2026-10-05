import React from "react";
import { requireAuth } from "@/lib/auth/session";
import {
  getOperationsTrips,
  getEligibleVehicles,
  getEligibleDrivers,
  getActiveDpds,
} from "@/lib/db/operations-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Truck,
  Search,
  Filter,
  Car,
  User,
  Building2,
  Calendar,
  Eye,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { CreateTripDialog } from "@/components/operations/create-trip-dialog";
import { TripActions } from "@/components/operations/trip-actions";
import { OrderImportDialog } from "@/components/operations/order-import-dialog";

interface SearchParams {
  search?: string;
  status?: string;
  date?: string;
  driverId?: string;
  vehicleId?: string;
  dpdId?: string;
  page?: string;
}

export default async function OperationsTripsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAuth(["OPERATIONS_MANAGER", "SUPER_ADMIN"]);
  const params = await searchParams;

  const page = parseInt(params.page ?? "1", 10);
  const search = params.search ?? "";
  const status = params.status ?? "ALL";
  const date = params.date ?? "";

  const [tripsData, eligibleVehicles, eligibleDrivers, activeDpds] = await Promise.all([
    getOperationsTrips({
      page,
      limit: 25,
      search: search || undefined,
      status: status !== "ALL" ? status : undefined,
      date: date || undefined,
    }),
    getEligibleVehicles(),
    getEligibleDrivers(),
    getActiveDpds(),
  ]);

  const targetTripsForImport = tripsData.trips.map(t => ({
    id: t.id,
    tripNumber: t.tripNumber,
    vehicleNumber: t.vehicle.vehicleNumber,
    driverName: t.driver.user.name,
  }));

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Trip Dispatch Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Schedule new trips, assign eligible fleet resources, monitor fulfillment and manage live routes
          </p>
        </div>

        <div className="flex items-center gap-2">
          {targetTripsForImport.length > 0 && (
            <OrderImportDialog trips={targetTripsForImport} />
          )}
          <CreateTripDialog
            vehicles={eligibleVehicles}
            drivers={eligibleDrivers}
            dpds={activeDpds}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="shadow-2xs">
        <CardContent className="p-3.5">
          <form method="GET" className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                name="search"
                defaultValue={search}
                placeholder="Search trip no, vehicle, driver, DPD..."
                className="pl-8 h-9 text-xs"
              />
            </div>

            <select
              name="status"
              defaultValue={status}
              className="h-9 px-3 text-xs border rounded-lg bg-background text-foreground"
            >
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="STARTED">Started</option>
              <option value="RUNNING">Running</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <Input
              type="date"
              name="date"
              defaultValue={date}
              className="h-9 text-xs w-36"
            />

            <Button type="submit" size="sm" variant="secondary" className="h-9 text-xs">
              <Filter className="h-3.5 w-3.5 mr-1" /> Filter
            </Button>

            {(search || status !== "ALL" || date) && (
              <Link href="/operations/trips">
                <Button type="button" size="sm" variant="ghost" className="h-9 text-xs">
                  Clear
                </Button>
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Trips Table */}
      <Card className="shadow-2xs">
        <CardContent className="p-0">
          {tripsData.trips.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-xs">
              No trips found matching the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                    <th className="p-3 font-semibold">Trip Number</th>
                    <th className="p-3 font-semibold">Date</th>
                    <th className="p-3 font-semibold">Vehicle</th>
                    <th className="p-3 font-semibold">Driver</th>
                    <th className="p-3 font-semibold">DPD Hub</th>
                    <th className="p-3 font-semibold">Delivery Progress</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tripsData.trips.map(trip => {
                    const total = trip.orders.length > 0 ? trip.orders.length : trip.totalOrders;
                    const delivered = trip.calculatedDelivered;
                    const failed = trip.calculatedFailed;
                    const pending = Math.max(0, total - delivered - failed);
                    const pct = total > 0 ? Math.round((delivered / total) * 100) : 0;

                    return (
                      <tr key={trip.id} className="hover:bg-muted/20">
                        <td className="p-3 font-semibold">
                          <Link href={`/operations/trips/${trip.id}`} className="text-primary hover:underline">
                            {trip.tripNumber}
                          </Link>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(trip.tripDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-3 font-medium">
                          {trip.vehicle.vehicleNumber}
                          <span className="text-[10px] text-muted-foreground block">{trip.vehicle.vehicleType}</span>
                        </td>
                        <td className="p-3 font-medium">
                          {trip.driver.user.name}
                          <span className="text-[10px] text-muted-foreground block">{trip.driver.user.phone ?? trip.driver.driverCode}</span>
                        </td>
                        <td className="p-3 font-medium">
                          {trip.dpd.name}
                          <span className="text-[10px] text-muted-foreground block">{trip.dpd.city}</span>
                        </td>
                        <td className="p-3">
                          <div className="w-32 space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span>{delivered}/{total} delivered</span>
                              <span className="font-semibold">{pct}%</span>
                            </div>
                            <Progress value={pct} className="h-1.5" />
                            {failed > 0 && (
                              <span className="text-[10px] text-red-500 block">{failed} failed</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold ${
                              trip.status === "RUNNING" ? "border-purple-500/40 text-purple-700 dark:text-purple-300 bg-purple-500/10" :
                              trip.status === "STARTED" ? "border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10" :
                              trip.status === "COMPLETED" ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10" :
                              trip.status === "CANCELLED" ? "border-red-500/40 text-red-700 dark:text-red-300 bg-red-500/10" :
                              "border-blue-500/40 text-blue-700 dark:text-blue-300 bg-blue-500/10"
                            }`}
                          >
                            {trip.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <TripActions
                            trip={{
                              id: trip.id,
                              tripNumber: trip.tripNumber,
                              status: trip.status,
                              totalOrders: total,
                              deliveredOrders: delivered,
                              failedOrders: failed,
                              calculatedPendingOrders: pending,
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
