import React from "react";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getTripDetailById } from "@/lib/db/operations-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Truck,
  Car,
  User,
  Building2,
  Calendar,
  Clock,
  Package,
  CheckCircle2,
  AlertCircle,
  Receipt,
  ArrowLeft,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { TripActions } from "@/components/operations/trip-actions";
import { AddOrderDialog } from "@/components/operations/add-order-dialog";
import { OrderImportDialog } from "@/components/operations/order-import-dialog";
import { AddExpenseDialog } from "@/components/operations/add-expense-dialog";

export default async function OperationsTripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth(["OPERATIONS_MANAGER", "SUPER_ADMIN"]);
  const { id } = await params;

  const trip = await getTripDetailById(id);
  if (!trip) notFound();

  const total = trip.orders.length > 0 ? trip.orders.length : trip.totalOrders;
  const delivered = trip.orders.filter(o => o.status === "DELIVERED").length;
  const failed = trip.orders.filter(o => o.status === "FAILED").length;
  const pending = Math.max(0, total - delivered - failed);
  const pct = total > 0 ? Math.round((delivered / total) * 100) : 0;

  const singleTripOption = [
    {
      id: trip.id,
      tripNumber: trip.tripNumber,
      vehicleNumber: trip.vehicle.vehicleNumber,
      driverName: trip.driver.user.name,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/operations/trips">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{trip.tripNumber}</h1>
              <Badge
                variant="outline"
                className={`text-xs font-bold uppercase ${
                  trip.status === "RUNNING" ? "border-purple-500/40 text-purple-700 dark:text-purple-300 bg-purple-500/10" :
                  trip.status === "STARTED" ? "border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10" :
                  trip.status === "COMPLETED" ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10" :
                  "border-blue-500/40 text-blue-700 dark:text-blue-300 bg-blue-500/10"
                }`}
              >
                {trip.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Scheduled Date: {new Date(trip.tripDate).toLocaleDateString("en-IN", { dateStyle: "long" })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {trip.status !== "COMPLETED" && trip.status !== "CANCELLED" && (
            <>
              <AddOrderDialog
                dpds={[{ id: trip.dpd.id, name: trip.dpd.name, city: trip.dpd.city }]}
                trips={singleTripOption}
                defaultTripId={trip.id}
              />
              <OrderImportDialog
                trips={singleTripOption}
                defaultTripId={trip.id}
              />
              <AddExpenseDialog
                trips={singleTripOption}
                defaultTripId={trip.id}
              />
            </>
          )}
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
        </div>
      </div>

      {/* Overview Cards: Vehicle, Driver, DPD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vehicle Card */}
        <Card className="shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase">
              <Car className="h-3.5 w-3.5 text-blue-500" /> Assigned Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-1 text-xs">
            <p className="text-base font-bold text-foreground">{trip.vehicle.vehicleNumber}</p>
            <p className="text-muted-foreground">{trip.vehicle.vehicleType} • {trip.vehicle.model ?? "Standard"}</p>
            <div className="pt-2 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Vehicle Status:</span>
              <Badge variant="outline" className="text-[10px] font-semibold">{trip.vehicle.status}</Badge>
            </div>
            {trip.startKm && (
              <p className="text-[11px] text-muted-foreground">Start Odometer: {trip.startKm} km</p>
            )}
          </CardContent>
        </Card>

        {/* Driver Card */}
        <Card className="shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase">
              <User className="h-3.5 w-3.5 text-amber-500" /> Assigned Driver
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-1 text-xs">
            <p className="text-base font-bold text-foreground">{trip.driver.user.name}</p>
            <p className="text-muted-foreground">Code: {trip.driver.driverCode}</p>
            <p className="text-muted-foreground">Mobile: {trip.driver.user.phone ?? "N/A"}</p>
            <div className="pt-2 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Driver Status:</span>
              <Badge variant="outline" className="text-[10px] font-semibold">{trip.driver.status}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* DPD Hub Card */}
        <Card className="shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase">
              <Building2 className="h-3.5 w-3.5 text-indigo-500" /> Origin DPD Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-1 text-xs">
            <p className="text-base font-bold text-foreground">{trip.dpd.name}</p>
            <p className="text-muted-foreground">Code: {trip.dpd.code} • City: {trip.dpd.city}</p>
            <p className="text-muted-foreground">Contact: {trip.dpd.contactPerson ?? "Hub Manager"} ({trip.dpd.contactPhone ?? "N/A"})</p>
          </CardContent>
        </Card>
      </div>

      {/* Fulfillment Progress Bar Card (Requirement #11) */}
      <Card className="shadow-2xs border-primary/20">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" /> Delivery Fulfillment Progress
            </CardTitle>
            <span className="text-xs font-bold text-primary">{pct}% Complete</span>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-3">
          <Progress value={pct} className="h-2.5" />
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-muted/50 p-2 rounded-lg">
              <p className="text-[10px] text-muted-foreground uppercase">Total Consignments</p>
              <p className="text-base font-bold">{total}</p>
            </div>
            <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-2 rounded-lg">
              <p className="text-[10px] uppercase">Delivered</p>
              <p className="text-base font-bold">{delivered}</p>
            </div>
            <div className="bg-amber-500/10 text-amber-700 dark:text-amber-400 p-2 rounded-lg">
              <p className="text-[10px] uppercase">Pending / In Transit</p>
              <p className="text-base font-bold">{pending}</p>
            </div>
            <div className="bg-red-500/10 text-red-700 dark:text-red-400 p-2 rounded-lg">
              <p className="text-[10px] uppercase">Failed / Exceptions</p>
              <p className="text-base font-bold">{failed}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manifest Orders Table */}
      <Card className="shadow-2xs">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" /> Manifest Orders & Consignments ({trip.orders.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Individual packages assigned to this trip route
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {trip.orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs space-y-2">
              <p>No orders assigned to this trip yet.</p>
              <div className="flex items-center justify-center gap-2">
                <AddOrderDialog
                  dpds={[{ id: trip.dpd.id, name: trip.dpd.name, city: trip.dpd.city }]}
                  trips={singleTripOption}
                  defaultTripId={trip.id}
                />
                <OrderImportDialog
                  trips={singleTripOption}
                  defaultTripId={trip.id}
                />
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                    <th className="p-3 font-semibold">Order ID</th>
                    <th className="p-3 font-semibold">Recipient</th>
                    <th className="p-3 font-semibold">Delivery Address</th>
                    <th className="p-3 font-semibold">City/Zip</th>
                    <th className="p-3 font-semibold">Package</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Delivered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {trip.orders.map(order => (
                    <tr key={order.id} className="hover:bg-muted/20">
                      <td className="p-3 font-semibold">{order.orderNumber}</td>
                      <td className="p-3">
                        <p className="font-medium">{order.recipientName}</p>
                        <p className="text-[10px] text-muted-foreground">{order.recipientPhone}</p>
                      </td>
                      <td className="p-3 max-w-xs truncate text-muted-foreground">{order.deliveryAddress}</td>
                      <td className="p-3 text-muted-foreground">{order.city} - {order.pincode}</td>
                      <td className="p-3 text-muted-foreground">{order.packageDetails ?? "Standard"}</td>
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
                        {order.delivery?.deliveryTime ? (
                          new Date(order.delivery.deliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        ) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operational Expenses Log */}
      {trip.expenses.length > 0 && (
        <Card className="shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Receipt className="h-4 w-4 text-amber-600" /> Logged Operational Expenses ({trip.expenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold">Amount</th>
                    <th className="p-3 font-semibold">Paid By</th>
                    <th className="p-3 font-semibold">Notes</th>
                    <th className="p-3 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {trip.expenses.map(exp => (
                    <tr key={exp.id}>
                      <td className="p-3 font-semibold">{exp.expenseType}</td>
                      <td className="p-3 font-bold text-amber-600">₹{Number(exp.amount).toFixed(2)}</td>
                      <td className="p-3 text-muted-foreground">{exp.paidBy}</td>
                      <td className="p-3 text-muted-foreground">{exp.notes ?? "-"}</td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(exp.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
