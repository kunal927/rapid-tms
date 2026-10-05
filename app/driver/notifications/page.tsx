import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { resolveDriverContext, getDriverNotifications } from "@/lib/db/driver-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Truck, CreditCard, Receipt, AlertTriangle, ArrowRight } from "lucide-react";

export default async function DriverNotificationsPage() {
  const session = await requireAuth(["DRIVER", "SUPER_ADMIN", "OPERATIONS_MANAGER"]);
  const driverContext = await resolveDriverContext(session.id, session.driverId);
  const notifications = await getDriverNotifications(session.id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          Driver Alert Center
        </h1>
        <p className="text-xs text-muted-foreground">
          Trip assignments, expense & advance approvals, and operational notices
        </p>
      </div>

      {notifications.length === 0 ? (
        <Card className="p-8 text-center shadow-2xs rounded-2xl">
          <Bell className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-foreground">No Notifications</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            You're all caught up! New dispatch alerts will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const isAdvance = n.type.includes("ADVANCE");
            const isExpense = n.type.includes("EXPENSE");
            const isTrip = n.type.includes("TRIP");

            return (
              <Card
                key={n.id}
                className={`shadow-2xs rounded-xl p-3.5 space-y-1.5 transition-colors ${
                  !n.isRead ? "border-primary/40 bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isAdvance
                          ? "bg-blue-500/10 text-blue-600"
                          : isExpense
                          ? "bg-amber-500/10 text-amber-600"
                          : isTrip
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isAdvance ? (
                        <CreditCard className="w-4 h-4" />
                      ) : isExpense ? (
                        <Receipt className="w-4 h-4" />
                      ) : isTrip ? (
                        <Truck className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-bold text-xs text-foreground">
                      {n.title}
                    </span>
                  </div>

                  {!n.isRead && (
                    <Badge className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.2">
                      NEW
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground pl-8 leading-relaxed">
                  {n.message}
                </p>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 pl-8">
                  <span>
                    {new Date(n.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  {((n as any).linkUrl || (n as any).link) && (
                    <Link
                      href={(n as any).linkUrl || (n as any).link}
                      className="text-primary font-bold hover:underline flex items-center gap-0.5"
                    >
                      View Details <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
