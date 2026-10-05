import React from "react";
import { requireAuth } from "@/lib/auth/session";
import {
  getOperationsOrders,
  getActiveDpds,
  getOperationsTrips,
} from "@/lib/db/operations-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  Search,
  Filter,
  Truck,
  User,
  MapPin,
  Calendar,
  Eye,
  Upload,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { AddOrderDialog } from "@/components/operations/add-order-dialog";
import { OrderImportDialog } from "@/components/operations/order-import-dialog";

interface SearchParams {
  search?: string;
  status?: string;
  tripId?: string;
  date?: string;
  page?: string;
}

export default async function OperationsOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAuth(["OPERATIONS_MANAGER", "SUPER_ADMIN"]);
  const params = await searchParams;

  const page = parseInt(params.page ?? "1", 10);
  const search = params.search ?? "";
  const status = params.status ?? "ALL";
  const tripId = params.tripId ?? "";
  const date = params.date ?? "";

  const [ordersData, dpds, tripsData] = await Promise.all([
    getOperationsOrders({
      page,
      limit: 30,
      search: search || undefined,
      status: status !== "ALL" ? status : undefined,
      tripId: tripId || undefined,
      date: date || undefined,
    }),
    getActiveDpds(),
    getOperationsTrips({ limit: 50 }),
  ]);

  const activeTripOptions = tripsData.trips.map(t => ({
    id: t.id,
    tripNumber: t.tripNumber,
    vehicleNumber: t.vehicle.vehicleNumber,
    driverName: t.driver.user.name,
  }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Order & Consignment Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Register individual package deliveries, batch import manifests and assign shipments to routes
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTripOptions.length > 0 && (
            <OrderImportDialog trips={activeTripOptions} />
          )}
          <AddOrderDialog
            dpds={dpds}
            trips={activeTripOptions}
          />
        </div>
      </div>

      {/* Filter Card */}
      <Card className="shadow-2xs">
        <CardContent className="p-3.5">
          <form method="GET" className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                name="search"
                defaultValue={search}
                placeholder="Search order no, customer, phone, address..."
                className="pl-8 h-9 text-xs"
              />
            </div>

            <select
              name="status"
              defaultValue={status}
              className="h-9 px-3 text-xs border rounded-lg bg-background text-foreground"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="FAILED">Failed</option>
              <option value="RESCHEDULED">Rescheduled</option>
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

            {(search || status !== "ALL" || date || tripId) && (
              <Link href="/operations/orders">
                <Button type="button" size="sm" variant="ghost" className="h-9 text-xs">
                  Clear
                </Button>
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="shadow-2xs">
        <CardContent className="p-0">
          {ordersData.orders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-xs">
              No orders found matching your search criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                    <th className="p-3 font-semibold">Order ID</th>
                    <th className="p-3 font-semibold">Customer</th>
                    <th className="p-3 font-semibold">Delivery Address</th>
                    <th className="p-3 font-semibold">Assigned Trip / Driver</th>
                    <th className="p-3 font-semibold">Package / COD</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ordersData.orders.map(order => (
                    <tr key={order.id} className="hover:bg-muted/20">
                      <td className="p-3 font-semibold">
                        <span className="text-foreground">{order.orderNumber}</span>
                        <span className="text-[10px] text-muted-foreground block">{order.dpd.name}</span>
                      </td>
                      <td className="p-3">
                        <p className="font-medium">{order.recipientName}</p>
                        <p className="text-[10px] text-muted-foreground">{order.recipientPhone}</p>
                      </td>
                      <td className="p-3 max-w-xs truncate text-muted-foreground">
                        {order.deliveryAddress}
                        <span className="text-[10px] text-muted-foreground block">{order.city} - {order.pincode}</span>
                      </td>
                      <td className="p-3">
                        {order.trip ? (
                          <div>
                            <Link href={`/operations/trips/${order.trip.id}`} className="font-medium text-primary hover:underline flex items-center gap-1">
                              <Truck className="h-3 w-3" /> {order.trip.tripNumber}
                            </Link>
                            <span className="text-[10px] text-muted-foreground block">
                              {order.trip.driver?.user?.name} ({order.trip.vehicle?.vehicleNumber})
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span>{order.packageDetails ?? "Standard Package"}</span>
                        {Number(order.codAmount) > 0 && (
                          <span className="text-[10px] text-amber-600 font-semibold block">
                            COD: ₹{Number(order.codAmount).toFixed(0)}
                          </span>
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
                      <td className="p-3 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
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
