import React from "react";
import { requireAuth } from "@/lib/auth/session";
import {
  getOperationsDashboardMetrics,
  getEligibleVehicles,
  getEligibleDrivers,
  getActiveDpds,
  getOperationsTripBoard,
} from "@/lib/db/operations-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Truck,
  Car,
  Users,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  ClipboardList,
  MapPin,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { CreateTripDialog } from "@/components/operations/create-trip-dialog";
import { TripActions } from "@/components/operations/trip-actions";

export default async function OperationsDashboardPage() {
  const session = await requireAuth(["OPERATIONS_MANAGER", "SUPER_ADMIN"]);

  const [metrics, eligibleVehicles, eligibleDrivers, activeDpds, activeTrips] = await Promise.all([
    getOperationsDashboardMetrics(),
    getEligibleVehicles(),
    getEligibleDrivers(),
    getActiveDpds(),
    getOperationsTripBoard(),
  ]);

  const deliveryProgressPct = metrics.todayOrders > 0
    ? Math.round((metrics.deliveredOrders / metrics.todayOrders) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Operations & Dispatch Hub
            </h1>
            <Badge className="bg-amber-600 hover:bg-amber-600 text-white text-xs font-semibold px-2 py-0.5">
              Live Fleet Control
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Logged in as <strong>{session.name}</strong> • Real-time Trip Coordination & Delivery Monitoring
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/operations/board">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-medium">
              <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
              Today's Board
            </Button>
          </Link>
          <CreateTripDialog
            vehicles={eligibleVehicles}
            drivers={eligibleDrivers}
            dpds={activeDpds}
          />
        </div>
      </div>

      {/* Main Operational KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Card className="shadow-2xs">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Today's Trips</p>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <p className="text-2xl font-bold">{metrics.todayTrips}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total scheduled</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-blue-500/30 bg-blue-500/5">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Running Trips</p>
            <Play className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{metrics.runningTrips}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Live on route</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Assigned / Ready</p>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <p className="text-2xl font-bold text-amber-600">{metrics.assignedTrips}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting start</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Completed Today</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <p className="text-2xl font-bold text-emerald-600">{metrics.completedTrips}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Successfully closed</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Pending Start</p>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <p className="text-2xl font-bold">{metrics.pendingTrips}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Draft / assigned</p>
          </CardContent>
        </Card>
      </div>

      {/* Fleet & Resource Availability Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicles Availability */}
        <Card className="shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Car className="h-4 w-4 text-primary" />
                Fleet Vehicle Availability
              </span>
              <Link href="/operations/vehicles" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <p className="text-xs font-medium">Available for Trip</p>
                <p className="text-2xl font-bold mt-1">{metrics.availableVehicles}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300">
                <p className="text-xs font-medium">Vehicles On Trip</p>
                <p className="text-2xl font-bold mt-1">{metrics.vehiclesOnTrip}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Drivers Availability */}
        <Card className="shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-500" />
                Driver Resource Availability
              </span>
              <Link href="/operations/drivers" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <p className="text-xs font-medium">Available Drivers</p>
                <p className="text-2xl font-bold mt-1">{metrics.availableDrivers}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300">
                <p className="text-xs font-medium">Drivers On Trip</p>
                <p className="text-2xl font-bold mt-1">{metrics.driversOnTrip}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Delivery Fulfillment Progress Box (Requirement #2) */}
      <Card className="shadow-2xs border-amber-500/20 bg-gradient-to-br from-card via-card to-amber-500/5">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Package className="h-5 w-5 text-amber-600" />
                Today's Delivery Fulfillment Progress
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time compilation of package lifecycle from active trip dispatches
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1 w-fit">
              Overall Rate: {deliveryProgressPct}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-1 space-y-4">
          <Progress value={deliveryProgressPct} className="h-3" />

          {/* 4 Order Metrics Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border bg-card p-3 text-center">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Total Orders</p>
              <p className="text-2xl font-extrabold mt-0.5">{metrics.todayOrders}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Manifested today</p>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-center">
              <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Delivered</p>
              <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">{metrics.deliveredOrders}</p>
              <p className="text-[10px] text-emerald-600/80 mt-0.5">{deliveryProgressPct}% success</p>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-center">
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase">Pending</p>
              <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-0.5">{metrics.pendingOrders}</p>
              <p className="text-[10px] text-amber-600/80 mt-0.5">In transit</p>
            </div>

            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-center">
              <p className="text-[11px] font-semibold text-red-700 dark:text-red-400 uppercase">Failed / Issues</p>
              <p className="text-2xl font-extrabold text-red-700 dark:text-red-400 mt-0.5">{metrics.failedOrders}</p>
              <p className="text-[10px] text-red-600/80 mt-0.5">Requires action</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Dispatches Quick View */}
      <Card className="shadow-2xs">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Live Fleet Dispatches ({activeTrips.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Today's scheduled routes and active delivery progress
              </CardDescription>
            </div>
            <Link href="/operations/trips">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                Full Trip Manager <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {activeTrips.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              No trips recorded for today. Click <strong>Create Trip Dispatch</strong> to assign a route.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                    <th className="p-3 font-semibold">Trip No.</th>
                    <th className="p-3 font-semibold">Vehicle</th>
                    <th className="p-3 font-semibold">Driver</th>
                    <th className="p-3 font-semibold">DPD Hub</th>
                    <th className="p-3 font-semibold">Fulfillment</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activeTrips.slice(0, 8).map(trip => {
                    const total = trip.calculatedTotalOrders || trip.totalOrders || 0;
                    const delivered = trip.calculatedDeliveredOrders || trip.deliveredOrders || 0;
                    const pct = total > 0 ? Math.round((delivered / total) * 100) : 0;

                    return (
                      <tr key={trip.id} className="hover:bg-muted/20">
                        <td className="p-3 font-semibold">
                          <Link href={`/operations/trips/${trip.id}`} className="text-primary hover:underline">
                            {trip.tripNumber}
                          </Link>
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
                          <div className="w-28 space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span>{delivered}/{total}</span>
                              <span className="font-semibold">{pct}%</span>
                            </div>
                            <Progress value={pct} className="h-1.5" />
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold ${
                              trip.status === "RUNNING" ? "border-purple-500/40 text-purple-700 dark:text-purple-300 bg-purple-500/10" :
                              trip.status === "STARTED" ? "border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10" :
                              trip.status === "COMPLETED" ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10" :
                              "border-blue-500/40 text-blue-700 dark:text-blue-300 bg-blue-500/10"
                            }`}
                          >
                            {trip.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <TripActions trip={trip} />
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
