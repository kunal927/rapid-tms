import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { resolveDriverContext, getDriverTripHistory } from "@/lib/db/driver-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Truck, Calendar, Package, ChevronRight } from "lucide-react";

export default async function DriverTripHistoryPage() {
  const session = await requireAuth(["DRIVER", "SUPER_ADMIN", "OPERATIONS_MANAGER"]);
  const driverContext = await resolveDriverContext(session.id, session.driverId);
  const trips = await getDriverTripHistory(driverContext.id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          Trip History
        </h1>
        <p className="text-xs text-muted-foreground">
          Past completed routes, manifests and performance stats
        </p>
      </div>

      {trips.length === 0 ? (
        <Card className="p-8 text-center shadow-2xs rounded-2xl">
          <History className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-foreground">No Completed Trips</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your completed trips will be cataloged here once submitted.
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {trips.map((trip) => (
            <Card key={trip.id} className="shadow-2xs rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-foreground">
                      {trip.tripNumber}
                    </span>
                    <Badge
                      className={`text-[9px] font-bold px-1.5 py-0.2 ${
                        trip.status === "COMPLETED"
                          ? "bg-slate-700 text-white"
                          : trip.status === "RUNNING"
                          ? "bg-emerald-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {trip.status}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(trip.tripDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-foreground block">
                    {trip.vehicleNumber}
                  </span>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {trip.dpdName}
                  </span>
                </div>
              </div>

              {/* Counts */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-muted/30 p-2 rounded-xl">
                <div>
                  <span className="text-[9px] text-muted-foreground block">Total</span>
                  <span className="font-bold text-foreground">{trip.totalOrders}</span>
                </div>
                <div>
                  <span className="text-[9px] text-emerald-600 block">Delivered</span>
                  <span className="font-bold text-emerald-600">{trip.deliveredOrders}</span>
                </div>
                <div>
                  <span className="text-[9px] text-rose-600 block">Exceptions</span>
                  <span className="font-bold text-rose-600">{trip.failedOrders}</span>
                </div>
              </div>

              <div className="pt-0.5 flex justify-end">
                <Link href="/driver/trip">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs font-semibold text-primary flex items-center gap-1"
                  >
                    Open Active Trip <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
