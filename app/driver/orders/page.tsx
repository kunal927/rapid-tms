import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { resolveDriverContext, getDriverOrders } from "@/lib/db/driver-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Navigation,
  ChevronRight,
  Search,
} from "lucide-react";
import { DeliverOrderModal } from "@/components/driver/deliver-order-modal";
import { FailedOrderModal } from "@/components/driver/failed-order-modal";
import { RescheduleOrderModal } from "@/components/driver/reschedule-order-modal";

interface SearchParams {
  status?: string;
  q?: string;
}

export default async function DriverOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireAuth(["DRIVER", "SUPER_ADMIN", "OPERATIONS_MANAGER"]);
  const driverContext = await resolveDriverContext(session.id, session.driverId);
  const params = await searchParams;

  const currentTab = params.status || "ALL";
  const query = (params.q || "").toLowerCase().trim();

  const allOrders = await getDriverOrders(driverContext.id, undefined, currentTab === "ALL" ? undefined : currentTab);

  const orders = allOrders.filter((o) => {
    if (!query) return true;
    return (
      o.orderNumber.toLowerCase().includes(query) ||
      o.recipientName.toLowerCase().includes(query) ||
      o.recipientPhone.includes(query) ||
      o.deliveryAddress.toLowerCase().includes(query)
    );
  });

  const tabs = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Failed", value: "FAILED" },
  ];

  return (
    <div className="space-y-3.5">
      {/* Page Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          My Delivery Orders
        </h1>
        <p className="text-xs text-muted-foreground">
          Assigned consignments for your active trip route
        </p>
      </div>

      {/* Search Input */}
      <form method="GET" className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={params.q || ""}
          placeholder="Search customer, phone or order ID..."
          className="pl-9 h-10 text-xs rounded-xl"
        />
        {currentTab !== "ALL" && (
          <input type="hidden" name="status" value={currentTab} />
        )}
      </form>

      {/* Status Filter Tabs (Scrollable Mobile) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/driver/orders?status=${tab.value}${params.q ? `&q=${params.q}` : ""}`}
            >
              <Badge
                variant={isActive ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1.5 text-xs rounded-lg shrink-0 font-medium ${
                  isActive ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted"
                }`}
              >
                {tab.label}
              </Badge>
            </Link>
          );
        })}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="p-8 text-center shadow-2xs rounded-2xl">
          <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
          <h2 className="text-sm font-bold text-foreground">No Orders Found</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {query
              ? "No orders match your search keyword."
              : "No orders assigned for this status filter."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-2xs rounded-2xl overflow-hidden p-3.5 space-y-3">
              {/* Order Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-foreground">
                      {order.orderNumber}
                    </span>
                    <Badge
                      className={`text-[9px] font-bold px-1.5 py-0.2 ${
                        order.status === "DELIVERED"
                          ? "bg-emerald-600 text-white"
                          : order.status === "OUT_FOR_DELIVERY"
                          ? "bg-blue-600 text-white"
                          : order.status === "FAILED"
                          ? "bg-rose-600 text-white"
                          : "bg-amber-600 text-white"
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-foreground mt-0.5">
                    {order.recipientName}
                  </h3>
                </div>

                <div className="text-right">
                  {order.codAmount > 0 ? (
                    <Badge variant="outline" className="border-amber-500/40 text-amber-600 font-bold text-[10px]">
                      COD ₹{order.codAmount}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 font-bold text-[10px]">
                      PREPAID
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground block mt-0.5 font-mono">
                    Trip: {order.tripNumber}
                  </span>
                </div>
              </div>

              {/* Package & Address */}
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span>{order.packageDetails}</span>
                </div>

                <div className="flex items-start gap-1.5 bg-muted/30 p-2.5 rounded-xl">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground/90 leading-tight">
                    {order.deliveryAddress}, {order.city} - {order.pincode}
                  </span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                {/* Phone Call */}
                <a href={`tel:${order.recipientPhone}`} className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-10 text-xs font-semibold rounded-xl text-primary border-primary/30 flex items-center justify-center gap-1.5 touch-manipulation"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </Button>
                </a>

                {/* Google Maps Navigate */}
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
                    className="w-full h-10 text-xs font-semibold rounded-xl text-emerald-600 border-emerald-500/30 flex items-center justify-center gap-1.5 touch-manipulation"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Maps
                  </Button>
                </a>

                {/* Detailed View Link */}
                <Link href={`/driver/orders/${order.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 px-2.5 text-xs rounded-xl flex items-center gap-1"
                  >
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              {/* Primary Delivery Action Button */}
              {order.status !== "DELIVERED" && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <DeliverOrderModal
                    orderId={order.id}
                    orderNumber={order.orderNumber}
                    defaultRecipientName={order.recipientName}
                  />

                  <FailedOrderModal
                    orderId={order.id}
                    orderNumber={order.orderNumber}
                  />
                </div>
              )}

              {order.status === "DELIVERED" && (
                <div className="flex items-center justify-between text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 p-2.5 rounded-xl font-semibold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Delivered Successfully
                  </span>
                  <Link
                    href={`/driver/orders/${order.id}`}
                    className="text-[11px] underline font-bold"
                  >
                    View POD Proof
                  </Link>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
