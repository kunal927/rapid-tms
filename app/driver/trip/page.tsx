import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { resolveDriverContext, getDriverCurrentTrip } from "@/lib/db/driver-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Truck,
  MapPin,
  Calendar,
  Gauge,
  Package,
  CheckCircle2,
  Clock,
  Building2,
  Receipt,
  Navigation,
} from "lucide-react";
import { DriverTripActions } from "@/components/driver/driver-trip-actions";
import { AddDriverExpenseSheet } from "@/components/driver/add-driver-expense-sheet";

export default async function DriverCurrentTripPage() {
  const session = await requireAuth(["DRIVER", "SUPER_ADMIN", "OPERATIONS_MANAGER"]);
  const driverContext = await resolveDriverContext(session.id, session.driverId);
  const trip = await getDriverCurrentTrip(driverContext.id);

  if (!trip) {
    return (
      <Card className="p-8 text-center shadow-2xs rounded-2xl">
        <Truck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
        <h2 className="text-base font-bold text-foreground">No Active Trip Assigned</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          You do not have any trip assigned for today yet. Contact your transport manager if you are waiting for a route.
        </p>
        <div className="pt-4 flex justify-center gap-2">
          <Link href="/driver/trips">
            <Button variant="outline" size="sm" className="h-10 text-xs font-semibold rounded-xl">
              View Past Trips
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Trip Header Banner */}
      <Card className="shadow-2xs overflow-hidden rounded-2xl border-primary/20">
        <div className="bg-primary/10 p-4 border-b flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">Active Trip:</span>
              <span className="font-mono font-bold text-base text-primary">
                {trip.tripNumber}
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(trip.tripDate).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <Badge
            className={`text-xs font-bold px-2.5 py-1 ${
              trip.status === "RUNNING"
                ? "bg-emerald-600 text-white"
                : trip.status === "ASSIGNED"
                ? "bg-blue-600 text-white"
                : trip.status === "COMPLETED"
                ? "bg-slate-700 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {trip.status}
          </Badge>
        </div>

        {/* Route Details */}
        <CardContent className="p-4 space-y-3.5 text-xs">
          <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-xl">
            <Building2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-muted-foreground block font-semibold uppercase">
                DPD Logistics Hub
              </span>
              <span className="font-bold text-foreground text-sm">{trip.dpdName}</span>
              <p className="text-muted-foreground text-[11px] mt-0.5">{trip.dpdAddress}</p>
            </div>
          </div>

          {/* Route path */}
          <div className="grid grid-cols-2 gap-2 bg-muted/20 p-3 rounded-xl border">
            <div>
              <span className="text-[10px] text-muted-foreground block">Origin / Departure</span>
              <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {trip.origin}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Destination Sector</span>
              <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                {trip.destination}
              </span>
            </div>
          </div>

          {/* Vehicle and Odometer */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/30 p-2.5 rounded-xl border">
              <span className="text-[10px] text-muted-foreground block">Vehicle</span>
              <span className="font-bold text-foreground font-mono mt-0.5 block">
                {trip.vehicleNumber}
              </span>
              <span className="text-[9px] text-muted-foreground block truncate">
                {trip.vehicleModel}
              </span>
            </div>

            <div className="bg-muted/30 p-2.5 rounded-xl border">
              <span className="text-[10px] text-muted-foreground block">Start Odometer</span>
              <span className="font-bold text-foreground font-mono mt-0.5 block">
                {trip.startKm ? `${trip.startKm} km` : "--"}
              </span>
            </div>

            <div className="bg-muted/30 p-2.5 rounded-xl border">
              <span className="text-[10px] text-muted-foreground block">Rate / Order</span>
              <span className="font-bold text-emerald-600 mt-0.5 block">
                ₹{trip.perOrderRate.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Consignment Metrics */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="bg-muted/30 p-2 rounded-xl text-center">
              <span className="text-[9px] text-muted-foreground block">Total</span>
              <span className="font-extrabold text-sm text-foreground">{trip.totalOrders}</span>
            </div>
            <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 p-2 rounded-xl text-center">
              <span className="text-[9px] block">Delivered</span>
              <span className="font-extrabold text-sm">{trip.deliveredOrders}</span>
            </div>
            <div className="bg-amber-500/10 text-amber-700 dark:text-amber-300 p-2 rounded-xl text-center">
              <span className="text-[9px] block">Pending</span>
              <span className="font-extrabold text-sm">{trip.pendingOrders}</span>
            </div>
            <div className="bg-rose-500/10 text-rose-700 dark:text-rose-300 p-2 rounded-xl text-center">
              <span className="text-[9px] block">Failed</span>
              <span className="font-extrabold text-sm">{trip.failedOrders}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Driver Trip Actions */}
      <DriverTripActions
        tripId={trip.id}
        tripNumber={trip.tripNumber}
        status={trip.status}
        currentStartKm={trip.startKm}
        totalOrders={trip.totalOrders}
        deliveredOrders={trip.deliveredOrders}
        failedOrders={trip.failedOrders}
        pendingOrders={trip.pendingOrders}
      />

      {/* Quick Links Card */}
      <div className="grid grid-cols-2 gap-2">
        <Link href="/driver/orders">
          <Button variant="outline" className="w-full h-11 text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
            <Package className="h-4 w-4" /> View Manifest Orders
          </Button>
        </Link>
        <AddDriverExpenseSheet currentTripId={trip.id} />
      </div>
    </div>
  );
}
