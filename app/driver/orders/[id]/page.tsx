import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { resolveDriverContext, getDriverOrderDetail } from "@/lib/db/driver-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Navigation,
  ArrowLeft,
  Truck,
  Building2,
  Clock,
  FileText,
  Lock,
} from "lucide-react";
import { DeliverOrderModal } from "@/components/driver/deliver-order-modal";
import { FailedOrderModal } from "@/components/driver/failed-order-modal";
import { RescheduleOrderModal } from "@/components/driver/reschedule-order-modal";

export default async function DriverOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth(["DRIVER", "SUPER_ADMIN", "OPERATIONS_MANAGER"]);
  const { id } = await params;
  const driverContext = await resolveDriverContext(session.id, session.driverId);
  const order = await getDriverOrderDetail(driverContext.id, id);

  if (!order) {
    notFound();
  }

  const isDelivered = order.status === "DELIVERED";

  return (
    <div className="space-y-4">
      {/* Back button & Title */}
      <div className="flex items-center gap-2">
        <Link href="/driver/orders">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-base font-bold text-foreground">
            Order {order.orderNumber}
          </h1>
          <p className="text-[11px] text-muted-foreground">Consignment Details & POD</p>
        </div>
      </div>

      {/* Main Order Card */}
      <Card className="shadow-2xs rounded-2xl overflow-hidden">
        <div className="bg-muted/40 p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <span className="font-mono font-bold text-xs">{order.orderNumber}</span>
          </div>

          <Badge
            className={`text-xs font-bold px-2 py-0.5 ${
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

        <CardContent className="p-4 space-y-4 text-xs">
          {/* Customer & Call */}
          <div className="flex items-center justify-between bg-muted/20 p-3 rounded-xl border">
            <div>
              <span className="text-[10px] text-muted-foreground block font-semibold uppercase">
                Customer Name
              </span>
              <span className="text-sm font-bold text-foreground">{order.recipientName}</span>
              <span className="text-xs text-muted-foreground block font-mono mt-0.5">
                {order.recipientPhone}
              </span>
            </div>

            <a href={`tel:${order.recipientPhone}`}>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-1.5 touch-manipulation"
              >
                <Phone className="w-3.5 h-3.5" /> Call Customer
              </Button>
            </a>
          </div>

          {/* Delivery Location & Map Navigate */}
          <div className="space-y-2">
            <div className="flex items-start gap-2 bg-muted/30 p-3 rounded-xl border">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-[10px] text-muted-foreground block font-semibold uppercase">
                  Delivery Destination
                </span>
                <p className="font-medium text-foreground text-xs leading-relaxed">
                  {order.deliveryAddress}
                </p>
                <p className="text-muted-foreground font-semibold mt-1">
                  {order.city} - {order.pincode}
                </p>
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${order.deliveryAddress}, ${order.city}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <Button
                variant="outline"
                className="w-full h-11 text-xs font-semibold rounded-xl text-emerald-600 border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" /> Open in Google Maps Navigation
              </Button>
            </a>
          </div>

          {/* Package Details & Payment */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-muted/30 p-3 rounded-xl border">
              <span className="text-[10px] text-muted-foreground block">Payment Type</span>
              <span className="font-bold text-sm text-foreground mt-0.5 block">
                {order.paymentType}
              </span>
              {order.codAmount > 0 ? (
                <span className="text-xs font-bold text-amber-600">Collect: ₹{order.codAmount}</span>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-600">Paid Online</span>
              )}
            </div>

            <div className="bg-muted/30 p-3 rounded-xl border">
              <span className="text-[10px] text-muted-foreground block">Weight & Specs</span>
              <span className="font-bold text-sm text-foreground mt-0.5 block">
                {order.weightKg} kg
              </span>
              <span className="text-[10px] text-muted-foreground truncate block">
                {order.packageDetails}
              </span>
            </div>
          </div>

          {/* Trip & DPD Assignment */}
          <div className="bg-muted/20 p-2.5 rounded-xl text-[11px] text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Trip Number:</span>
              <span className="font-bold text-foreground font-mono">{order.trip.tripNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Vehicle:</span>
              <span className="font-semibold text-foreground font-mono">{order.trip.vehicleNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Origin Hub:</span>
              <span className="font-semibold text-foreground">{order.trip.dpdName}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proof Of Delivery (POD) Section if Delivered */}
      {isDelivered && order.delivery && (
        <Card className="shadow-2xs rounded-2xl overflow-hidden border-emerald-500/30">
          <CardHeader className="bg-emerald-500/10 p-4 pb-3 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Proof of Delivery (POD)
            </CardTitle>
            <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
              VERIFIED
            </Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/30 p-2.5 rounded-xl border">
                <span className="text-[10px] text-muted-foreground block">Delivered At</span>
                <span className="font-bold text-foreground mt-0.5 block">
                  {new Date(order.delivery.deliveryTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(order.delivery.deliveryTime).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>

              <div className="bg-muted/30 p-2.5 rounded-xl border">
                <span className="text-[10px] text-muted-foreground block">Received By</span>
                <span className="font-bold text-foreground mt-0.5 block">
                  {order.delivery.recipientName || order.recipientName}
                </span>
                {order.delivery.otpVerified && (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> OTP Verified
                  </span>
                )}
              </div>
            </div>

            {/* Signature Preview */}
            {order.delivery.signatureUrl && (
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                  Customer Signature
                </span>
                <div className="border rounded-xl p-2 bg-muted/20 flex items-center justify-center">
                  <img
                    src={order.delivery.signatureUrl}
                    alt="Customer Signature"
                    className="max-h-20 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Photo Preview */}
            {order.delivery.photoUrl && (
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                  Parcel Doorstep Photo
                </span>
                <div className="border rounded-xl overflow-hidden bg-muted/20">
                  <img
                    src={order.delivery.photoUrl}
                    alt="Parcel Doorstep Photo"
                    className="w-full max-h-48 object-cover"
                  />
                </div>
              </div>
            )}

            {order.delivery.remarks && (
              <div className="bg-muted/20 p-2.5 rounded-xl text-muted-foreground">
                <span className="text-[10px] font-semibold text-foreground block">Remarks:</span>
                <p className="mt-0.5">{order.delivery.remarks}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Non-Delivery Exception History */}
      {order.attempts && order.attempts.length > 0 && (
        <Card className="shadow-2xs rounded-2xl overflow-hidden border-rose-500/30">
          <CardHeader className="bg-rose-500/10 p-4 pb-2 border-b">
            <CardTitle className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 uppercase">
              <XCircle className="w-3.5 h-3.5" /> Delivery Exception Attempts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2 text-xs">
            {order.attempts.map((att) => (
              <div key={att.id} className="bg-muted/30 p-2.5 rounded-xl border space-y-1">
                <div className="flex justify-between font-semibold text-rose-600">
                  <span>Attempt #{att.attemptNumber}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(att.attemptedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="font-medium text-foreground">{att.reason}</p>
                {att.remarks && <p className="text-muted-foreground text-[11px]">{att.remarks}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sticky Bottom Actions Bar (if not delivered) */}
      {!isDelivered && (
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <FailedOrderModal
              orderId={order.id}
              orderNumber={order.orderNumber}
            />

            <RescheduleOrderModal
              orderId={order.id}
              orderNumber={order.orderNumber}
            />
          </div>

          <DeliverOrderModal
            orderId={order.id}
            orderNumber={order.orderNumber}
            defaultRecipientName={order.recipientName}
          />
        </div>
      )}
    </div>
  );
}
