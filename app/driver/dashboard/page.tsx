import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { resolveDriverContext, getDriverDashboardData } from "@/lib/db/driver-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  ArrowRight,
  MapPin,
  Phone,
  Navigation,
} from "lucide-react";
import { DeliverOrderModal } from "@/components/driver/deliver-order-modal";
import { FailedOrderModal } from "@/components/driver/failed-order-modal";

export default async function DriverDashboardPage() {
  const session = await requireAuth(["DRIVER", "SUPER_ADMIN", "OPERATIONS_MANAGER"]);
  const driverContext = await resolveDriverContext(session.id, session.driverId);
  const data = await getDriverDashboardData(driverContext.id);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const trip = data?.activeTrip;
  const orders = data?.orders || [];

  return (
    <div className="space-y-4">
      {/* Driver Header Greeting & Vehicle Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 rounded-2xl border border-primary/20 flex flex-col gap-1.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              {greeting}
            </span>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {data.driverName}
            </h1>
          </div>
          <Badge
            className={`text-xs font-bold px-2 py-0.5 ${
              trip?.status === "RUNNING"
                ? "bg-emerald-600 text-white"
                : trip?.status === "ASSIGNED"
                ? "bg-blue-600 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {trip?.status || "STANDBY"}
          </Badge>
        </div>

        {trip ? (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Assigned Vehicle</span>
                <span className="font-bold text-foreground font-mono">{trip.vehicleNumber}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Package className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Active Trip</span>
                <span className="font-bold text-foreground font-mono">{trip.tripNumber}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground pt-1">
            No active trip assigned at this moment. You are currently in standby mode.
          </p>
        )}
      </div>

      {/* KPI Cards */}
      {trip ? (
        <>
          <div className="grid grid-cols-4 gap-2">
            {/* Total Orders */}
            <Card className="shadow-2xs p-2.5 sm:p-3 text-center rounded-xl">
              <span className="text-[10px] font-semibold text-muted-foreground block">
                Orders
              </span>
              <span className="text-xl sm:text-2xl font-black text-foreground">
                {trip.totalOrders}
              </span>
            </Card>

            {/* Delivered */}
            <Card className="shadow-2xs p-2.5 sm:p-3 text-center rounded-xl bg-emerald-500/5 border-emerald-500/20">
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                Delivered
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {trip.deliveredCount}
              </span>
            </Card>

            {/* Pending */}
            <Card className="shadow-2xs p-2.5 sm:p-3 text-center rounded-xl bg-amber-500/5 border-amber-500/20">
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 block">
                Pending
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                {trip.pendingCount}
              </span>
            </Card>

            {/* Failed */}
            <Card className="shadow-2xs p-2.5 sm:p-3 text-center rounded-xl bg-rose-500/5 border-rose-500/20">
              <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 block">
                Failed
              </span>
              <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
                {trip.failedCount}
              </span>
            </Card>
          </div>

          {/* Delivery Progress Card */}
          <Card className="shadow-2xs p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Delivery Progress
              </span>
              <span className="font-bold text-emerald-600">
                {trip.deliveredCount} / {trip.totalOrders} ({trip.progressPercent}%)
              </span>
            </div>
            <Progress value={trip.progressPercent} className="h-2.5 rounded-full" />
            <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>{trip.dpdName} Terminal</span>
              <span>₹{trip.perOrderRate} / delivered order</span>
            </div>
          </Card>

          {/* Action Button Banner */}
          {trip.status === "ASSIGNED" && (
            <Link href="/driver/trip" className="block">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-sm rounded-xl touch-manipulation shadow-md flex items-center justify-center gap-2">
                <Play className="h-5 w-5 fill-current" /> START TRIP ({trip.tripNumber})
              </Button>
            </Link>
          )}

          {trip.status === "RUNNING" && (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/driver/orders">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-xs rounded-xl touch-manipulation shadow-xs flex items-center justify-center gap-1.5">
                  <Package className="h-4 w-4" /> ALL ORDERS ({orders.length})
                </Button>
              </Link>
              <Link href="/driver/trip">
                <Button variant="outline" className="w-full font-bold h-11 text-xs rounded-xl flex items-center justify-center gap-1.5">
                  <Truck className="h-4 w-4" /> TRIP DETAILS <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          )}

          {/* Pending Delivery Orders Quick List */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" /> Next Consignments for Delivery
              </h2>
              <Link
                href="/driver/orders"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {orders.filter((o) => o.status !== "DELIVERED").length === 0 ? (
              <Card className="p-6 text-center shadow-2xs rounded-xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-foreground">All Orders Delivered!</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You have successfully delivered all consignments for this trip.
                </p>
                <div className="pt-3">
                  <Link href="/driver/trip">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 rounded-xl">
                      Complete Trip
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {orders
                  .filter((o) => o.status !== "DELIVERED")
                  .slice(0, 3)
                  .map((order) => (
                    <Card key={order.id} className="shadow-2xs rounded-xl p-3.5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-foreground">
                              {order.orderNumber}
                            </span>
                            <Badge
                              className={`text-[9px] font-bold px-1.5 py-0.2 ${
                                order.status === "OUT_FOR_DELIVERY"
                                  ? "bg-blue-600 text-white"
                                  : order.status === "FAILED"
                                  ? "bg-rose-600 text-white"
                                  : "bg-amber-600 text-white"
                              }`}
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <h4 className="text-xs font-bold text-foreground mt-1">
                            {order.recipientName}
                          </h4>
                        </div>

                        {order.codAmount > 0 ? (
                          <Badge variant="outline" className="border-amber-500/40 text-amber-600 font-bold text-[10px]">
                            COD ₹{order.codAmount}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 font-bold text-[10px]">
                            PREPAID
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground flex items-start gap-1.5 bg-muted/30 p-2 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {order.deliveryAddress}, {order.city} - {order.pincode}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`tel:${order.recipientPhone}`}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-10 text-xs font-semibold rounded-xl text-primary border-primary/30 flex items-center justify-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5" /> Call
                          </Button>
                        </a>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${order.deliveryAddress}, ${order.city}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-10 text-xs font-semibold rounded-xl text-emerald-600 border-emerald-500/30 flex items-center justify-center gap-1.5"
                          >
                            <Navigation className="w-3.5 h-3.5" /> Navigate
                          </Button>
                        </a>

                        <div className="flex-1">
                          <DeliverOrderModal
                            orderId={order.id}
                            orderNumber={order.orderNumber}
                            defaultRecipientName={order.recipientName}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Empty State */
        <Card className="p-8 text-center shadow-2xs rounded-2xl">
          <Truck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h2 className="text-base font-bold text-foreground">No Active Trip Assigned</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Your dispatcher or operations manager will assign a trip and route manifest shortly. Please ensure you are checked in on attendance.
          </p>
          <div className="pt-4 flex justify-center gap-2">
            <Link href="/driver/attendance">
              <Button size="sm" className="h-10 text-xs font-semibold rounded-xl">
                Check In Attendance
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
