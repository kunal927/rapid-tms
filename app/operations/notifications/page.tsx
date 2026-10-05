import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { getOperationsNotifications } from "@/lib/db/operations-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Truck, AlertTriangle, Package } from "lucide-react";
import { MarkAllReadButton } from "@/components/admin/mark-all-read-button";

export default async function OperationsNotificationsPage() {
  const session = await requireAuth(["OPERATIONS_MANAGER", "SUPER_ADMIN"]);

  const notifications = await getOperationsNotifications(session.id);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Operations Alert Center</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Real-time route dispatches, driver updates, exception alerts and fleet notifications
          </p>
        </div>

        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      <Card className="shadow-2xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Active Notifications
            </span>
            {unreadCount > 0 && (
              <Badge className="bg-amber-600 text-white text-[10px] font-bold">
                {unreadCount} Unread
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-xs">
              No notifications at this time. All routes operating smoothly.
            </div>
          ) : (
            <div className="divide-y text-xs">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-4 flex items-start gap-3 transition-colors ${
                    !n.isRead ? "bg-amber-500/5 dark:bg-amber-950/20" : "hover:bg-muted/20"
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    n.type.includes("ALERT") || n.type.includes("FAILED")
                      ? "bg-red-500/10 text-red-600"
                      : n.type.includes("COMPLETED")
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-blue-500/10 text-blue-600"
                  }`}>
                    {n.type.includes("ALERT") || n.type.includes("FAILED") ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Truck className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`font-semibold text-foreground ${!n.isRead ? "font-bold" : ""}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
