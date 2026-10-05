import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { getOperationsDeliveries } from "@/lib/db/operations-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Search,
  Filter,
  Truck,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Camera,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface SearchParams {
  search?: string;
  status?: string;
  driverId?: string;
  page?: string;
}

const STATUS_TABS = [
  { id: "ALL", label: "All Deliveries" },
  { id: "PENDING", label: "Pending" },
  { id: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { id: "DELIVERED", label: "Delivered" },
  { id: "FAILED", label: "Failed" },
  { id: "RESCHEDULED", label: "Rescheduled" },
];

export default async function OperationsDeliveriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAuth(["OPERATIONS_MANAGER", "SUPER_ADMIN"]);
  const params = await searchParams;

  const page = parseInt(params.page ?? "1", 10);
  const search = params.search ?? "";
  const status = params.status ?? "ALL";
  const driverId = params.driverId ?? "";

  const deliveriesData = await getOperationsDeliveries({
    page,
    limit: 30,
    search: search || undefined,
    status: status !== "ALL" ? status : undefined,
    driverId: driverId || undefined,
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Delivery Fulfillment & POD Monitoring</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Track real-time proof of delivery, delivery status attempts, and fulfillment timestamps
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b pb-2">
        {STATUS_TABS.map(tab => (
          <Link
            key={tab.id}
            href={`/operations/deliveries?status=${tab.id}${search ? `&search=${search}` : ""}`}
          >
            <Button
              variant={status === tab.id ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs font-medium"
            >
              {tab.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <form method="GET">
            <input type="hidden" name="status" value={status} />
            <Input
              name="search"
              defaultValue={search}
              placeholder="Search by order, customer, address..."
              className="pl-8 h-9 text-xs"
            />
          </form>
        </div>
      </div>

      {/* Deliveries Table */}
      <Card className="shadow-2xs">
        <CardContent className="p-0">
          {deliveriesData.orders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-xs">
              No delivery records found matching this status filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                    <th className="p-3 font-semibold">Order / Consignment</th>
                    <th className="p-3 font-semibold">Trip No.</th>
                    <th className="p-3 font-semibold">Driver</th>
                    <th className="p-3 font-semibold">Customer & Destination</th>
                    <th className="p-3 font-semibold">Delivery Time</th>
                    <th className="p-3 font-semibold">Proof of Delivery (POD)</th>
                    <th className="p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {deliveriesData.orders.map(order => (
                    <tr key={order.id} className="hover:bg-muted/20">
                      <td className="p-3 font-semibold">
                        <span className="text-foreground">{order.orderNumber}</span>
                        <span className="text-[10px] text-muted-foreground block">{order.packageDetails ?? "Standard"}</span>
                      </td>
                      <td className="p-3">
                        {order.trip ? (
                          <Link href={`/operations/trips/${order.trip.id}`} className="font-medium text-primary hover:underline flex items-center gap-1">
                            <Truck className="h-3 w-3" /> {order.trip.tripNumber}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground italic">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        {order.trip?.driver ? (
                          <div>
                            <p className="font-medium">{order.trip.driver.user.name}</p>
                            <p className="text-[10px] text-muted-foreground">{order.trip.driver.user.phone ?? order.trip.driver.driverCode}</p>
                          </div>
                        ) : "-"}
                      </td>
                      <td className="p-3 max-w-xs">
                        <p className="font-medium">{order.recipientName} ({order.recipientPhone})</p>
                        <p className="text-[10px] text-muted-foreground truncate">{order.deliveryAddress}</p>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {order.delivery?.deliveryTime ? (
                          <div>
                            <span className="font-medium text-foreground">
                              {new Date(order.delivery.deliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] block">
                              {new Date(order.delivery.deliveryTime).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Pending</span>
                        )}
                      </td>
                      <td className="p-3">
                        {order.delivery?.photoUrl || order.delivery?.podDocuments?.length ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                            <Camera className="h-3.5 w-3.5" />
                            <span>POD Attached</span>
                          </div>
                        ) : order.delivery?.otpVerified ? (
                          <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>OTP Verified</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[10px] italic">No POD yet</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            order.status === "DELIVERED" ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10" :
                            order.status === "OUT_FOR_DELIVERY" ? "border-purple-500/40 text-purple-700 dark:text-purple-300 bg-purple-500/10" :
                            order.status === "FAILED" ? "border-red-500/40 text-red-700 dark:text-red-300 bg-red-500/10" :
                            "border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10"
                          }`}
                        >
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
