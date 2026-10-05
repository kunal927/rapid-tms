import { requireAuth } from "@/lib/auth/session";
import { getTripsAdmin, getAllVehiclesForSelect, getAllDriversForSelect, getAllDpdsForSelect } from "@/lib/db/admin-service";
import { isDatabaseLive } from "@/lib/db/service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Truck, Eye, Package, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { AddTripDialog } from "@/components/admin/add-trip-dialog";
import { TripActions } from "@/components/admin/trip-actions";

interface SearchParams {
  search?: string; status?: string; page?: string;
  vehicleId?: string; driverId?: string; dpdId?: string;
  dateFrom?: string; dateTo?: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  ASSIGNED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  STARTED: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  RUNNING: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  COMPLETED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

const TRIP_STATUSES = ["ALL", "DRAFT", "ASSIGNED", "STARTED", "RUNNING", "COMPLETED", "CANCELLED"];

export default async function TripsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAuth(["SUPER_ADMIN"]);
  const params = await searchParams;
  const dbLive = await isDatabaseLive();

  const page = parseInt(params.page ?? "1", 10);
  const search = params.search ?? "";
  const status = params.status ?? "ALL";

  let data: Awaited<ReturnType<typeof getTripsAdmin>> = { trips: [], total: 0, page: 1, totalPages: 1 };
  let vehicles: Awaited<ReturnType<typeof getAllVehiclesForSelect>> = [];
  let drivers: Awaited<ReturnType<typeof getAllDriversForSelect>> = [];
  let dpds: Awaited<ReturnType<typeof getAllDpdsForSelect>> = [];

  if (dbLive) {
    try {
      [data, vehicles, drivers, dpds] = await Promise.all([
        getTripsAdmin({ search, status, page }),
        getAllVehiclesForSelect(),
        getAllDriversForSelect(),
        getAllDpdsForSelect(),
      ]);
    } catch {}
  }

  // Status counts
  const statusCounts = TRIP_STATUSES.filter(s => s !== "ALL").reduce((acc, s) => {
    acc[s] = data.trips.filter(t => t.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Trip Management</h1>
          <p className="text-sm text-muted-foreground">Manage all trips, assignments and delivery progress</p>
        </div>
        {dbLive && (
          <AddTripDialog vehicles={vehicles} drivers={drivers} dpds={dpds} />
        )}
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {TRIP_STATUSES.filter(s => s !== "ALL").map(s => (
          <a
            key={s}
            href={`/admin/trips?status=${s}`}
            className={`rounded-xl border p-2 text-center hover:shadow-sm transition-all ${status === s ? "ring-2 ring-primary" : ""}`}
          >
            <p className="text-base font-bold">{dbLive ? (statusCounts[s] ?? 0) : "—"}</p>
            <p className="text-[10px] text-muted-foreground">{s.charAt(0) + s.slice(1).toLowerCase()}</p>
          </a>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <form className="flex-1 flex gap-2" method="get">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input name="search" defaultValue={search} placeholder="Search by trip number..." className="pl-9 h-9" />
              </div>
              {status !== "ALL" && <input type="hidden" name="status" value={status} />}
            </form>
            <div className="flex gap-1.5 flex-wrap">
              {TRIP_STATUSES.map(s => (
                <a
                  key={s}
                  href={`/admin/trips?status=${s}${search ? `&search=${search}` : ""}`}
                  className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-all ${
                    status === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                </a>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {!dbLive ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <Truck className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">Database Offline</p>
              <p className="text-xs text-muted-foreground">Connect MySQL to manage trips.</p>
            </div>
          ) : data.trips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <Truck className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">No trips found</p>
              <p className="text-xs text-muted-foreground">Create your first trip to get started.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Trip No.</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Vehicle</TableHead>
                    <TableHead className="text-xs">Driver</TableHead>
                    <TableHead className="text-xs">DPD</TableHead>
                    <TableHead className="text-xs">Orders</TableHead>
                    <TableHead className="text-xs">Delivered</TableHead>
                    <TableHead className="text-xs">Rate</TableHead>
                    <TableHead className="text-xs">Payment</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.trips.map(trip => {
                    const grossPay = trip.deliveredOrders * Number(trip.perOrderRate);
                    return (
                      <TableRow key={trip.id}>
                        <TableCell>
                          <span className="font-mono text-sm font-semibold">{trip.tripNumber}</span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(trip.tripDate).toLocaleDateString("en-IN")}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {trip.vehicle.vehicleNumber}
                          <div className="text-[10px] text-muted-foreground">{trip.vehicle.vehicleType}</div>
                        </TableCell>
                        <TableCell className="text-xs">{trip.driver.user.name}</TableCell>
                        <TableCell className="text-xs">{trip.dpd.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            {trip.totalOrders}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                            <CheckCircle2 className="h-3 w-3" />
                            {trip.deliveredOrders}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">₹{Number(trip.perOrderRate)}</TableCell>
                        <TableCell className="text-xs font-semibold">₹{grossPay.toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[trip.status]}`}>
                            {trip.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link href={`/admin/trips/${trip.id}`}>
                              <Button size="icon" variant="ghost" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                            </Link>
                            <TripActions tripId={trip.id} tripNumber={trip.tripNumber} status={trip.status} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages} · {data.total} trips</p>
                  <div className="flex gap-2">
                    {data.page > 1 && <a href={`/admin/trips?page=${data.page - 1}&status=${status}&search=${search}`}><Button variant="outline" size="sm" className="h-7 text-xs">Previous</Button></a>}
                    {data.page < data.totalPages && <a href={`/admin/trips?page=${data.page + 1}&status=${status}&search=${search}`}><Button variant="outline" size="sm" className="h-7 text-xs">Next</Button></a>}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
