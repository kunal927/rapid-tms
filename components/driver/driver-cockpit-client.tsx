"use client";

import React, { useState } from "react";
import { SeedTrip, SeedOrder } from "@/lib/db/seed-data";
import { UserSession } from "@/lib/auth/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Truck,
  Package,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  PhoneCall,
  ShieldCheck,
  ChevronRight,
  Receipt,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";

interface DriverCockpitClientProps {
  user: UserSession;
  trip?: SeedTrip;
  orders: SeedOrder[];
}

export function DriverCockpitClient({
  user,
  trip,
  orders: initialOrders,
}: DriverCockpitClientProps) {
  const [orders, setOrders] = useState<SeedOrder[]>(initialOrders);
  const [deliveredCount, setDeliveredCount] = useState(trip?.deliveredOrders || 0);
  const [failedCount, setFailedCount] = useState(trip?.failedOrders || 0);

  const perOrderRate = trip?.perOrderRate || 45.0;
  const driverAdvance = trip?.driverAdvance || 1500.0;
  const grossEarnings = deliveredCount * perOrderRate;
  const netEarnings = Math.max(0, grossEarnings - driverAdvance);
  const totalOrders = orders.length > 0 ? orders.length : (trip?.totalOrders || 48);
  const progressPercent = Math.round((deliveredCount / totalOrders) * 100);

  const handleMarkDelivered = async (orderId: string, orderNumber: string) => {
    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "DELIVERED",
          remarks: "Handed over to customer, POD verified",
        }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "DELIVERED" } : o))
        );
        setDeliveredCount((prev) => prev + 1);
        toast.success(`Order ${orderNumber} marked Delivered! +₹${perOrderRate.toFixed(2)} earned`);
      } else {
        toast.error("Failed to update order status");
      }
    } catch {
      toast.error("Network error while updating delivery");
    }
  };

  const handleMarkFailed = async (orderId: string, orderNumber: string) => {
    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "FAILED",
          remarks: "Customer unavailable / premises locked",
        }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "FAILED" } : o))
        );
        setFailedCount((prev) => prev + 1);
        toast.warning(`Order ${orderNumber} marked Failed. Rescheduling flagged.`);
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Driver Mobile Profile & Vehicle Card */}
      <Card className="border-primary/20 bg-linear-to-r from-primary/10 via-primary/5 to-card shadow-xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-sm">
                {user.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {user.name}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground font-mono">
                    ID: {user.driverId || "DRV-101"}
                  </span>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                    On Duty
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">Assigned Vehicle</p>
              <p className="font-mono font-bold text-sm text-foreground bg-card border px-2 py-0.5 rounded mt-0.5 shadow-2xs">
                {trip?.vehicleNumber || "DL-01-AB-1234"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Active Trip Card */}
      <Card id="assigned-trip" className="border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-primary" />
                Active Trip: {trip?.tripNumber || "TRP-2026-0042"}
              </CardTitle>
              <CardDescription className="text-xs">
                {trip?.dpdName || "North Delhi Express Hub"}
              </CardDescription>
            </div>
            <StatusBadge status={trip?.status || "RUNNING"} type="trip" />
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2 space-y-4">
          {/* Progress bar */}
          <div className="space-y-1.5 bg-muted/30 p-3 rounded-lg border">
            <div className="flex justify-between text-xs font-semibold">
              <span>Delivery Progress</span>
              <span className="font-mono text-primary">
                {deliveredCount} / {totalOrders} Delivered ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold block uppercase">
                Delivered
              </span>
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                {deliveredCount}
              </span>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
              <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold block uppercase">
                Remaining
              </span>
              <span className="text-lg font-bold text-amber-700 dark:text-amber-400 font-mono">
                {Math.max(0, totalOrders - deliveredCount - failedCount)}
              </span>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
              <span className="text-[10px] text-rose-800 dark:text-rose-300 font-semibold block uppercase">
                Exceptions
              </span>
              <span className="text-lg font-bold text-rose-700 dark:text-rose-400 font-mono">
                {failedCount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Earnings & Advance Breakdown */}
      <Card id="earnings" className="border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-600" />
            My Earnings & Advance Breakdown
          </CardTitle>
          <CardDescription className="text-xs">
            Calculated strictly from company rate card (₹{perOrderRate.toFixed(2)} / delivered order)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-2 text-xs font-mono">
          <div className="flex justify-between py-1 border-b">
            <span className="text-muted-foreground">Gross Earnings ({deliveredCount} orders × ₹{perOrderRate.toFixed(2)})</span>
            <span className="font-bold text-foreground">₹{grossEarnings.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 border-b text-amber-600">
            <span>Advance Received for Today's Trip</span>
            <span className="font-bold">- ₹{driverAdvance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-sm bg-muted/40 px-2 rounded">
            <span>Net Payable Balance</span>
            <span className="text-emerald-600">₹{netEarnings.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Delivery Queue for Driver */}
      <div id="orders-list" className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Package className="w-4 h-4 text-primary" />
            Today's Delivery Stops ({orders.length})
          </h3>
          <span className="text-[11px] text-muted-foreground">Tap to update POD</span>
        </div>

        <div className="space-y-3">
          {orders.map((order, idx) => (
            <Card
              key={order.id}
              className={`border transition-all duration-200 ${
                order.status === "DELIVERED"
                  ? "bg-emerald-500/5 border-emerald-500/30"
                  : order.status === "FAILED"
                  ? "bg-rose-500/5 border-rose-500/30"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-foreground">
                        #{idx + 1} {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          order.paymentType === "COD"
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                            : "bg-blue-500/20 text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        {order.paymentType} {order.codAmount > 0 ? `(₹${order.codAmount})` : ""}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      {order.recipientName}
                    </p>
                  </div>
                  <StatusBadge status={order.status} type="order" />
                </div>

                <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>
                    {order.deliveryAddress}, {order.city} - {order.pincode}
                  </span>
                </div>

                {order.remarks && (
                  <p className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded italic">
                    Note: {order.remarks}
                  </p>
                )}

                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t gap-2">
                  <a
                    href={`tel:${order.recipientPhone}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-lg transition-colors min-h-[40px]"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Customer
                  </a>

                  {order.status !== "DELIVERED" && order.status !== "FAILED" ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkFailed(order.id, order.orderNumber)}
                        className="text-xs h-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Failed
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleMarkDelivered(order.id, order.orderNumber)}
                        className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Delivered
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> POD Recorded
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Emergency Help / SOS Card */}
      <Card className="border-rose-500/30 bg-rose-500/5 shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-rose-600" />
              Route Emergency / Vehicle Breakdown?
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Direct line to 24/7 Operations Control Room
            </p>
          </div>
          <a
            href="tel:+919811122334"
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-xs"
          >
            Call SOS
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
