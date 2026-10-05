import { requireAuth } from "@/lib/auth/session";
import { getNotifications, markNotificationRead } from "@/lib/db/admin-service";
import { isDatabaseLive } from "@/lib/db/service";
import { getCurrentSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { MarkAllReadButton } from "@/components/admin/mark-all-read-button";

const TYPE_COLORS: Record<string, string> = {
  INFO: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  WARNING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  ERROR: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  SUCCESS: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
};

export default async function NotificationsPage() {
  const session = await requireAuth(["SUPER_ADMIN"]);
  const dbLive = await isDatabaseLive();

  let notifications: Awaited<ReturnType<typeof getNotifications>> = [];

  if (dbLive && session?.id) {
    try { notifications = await getNotifications(session.id, 50); } catch {}
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">System alerts, reminders and activity updates</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <div className="rounded-full bg-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5">
              {unreadCount} unread
            </div>
          )}
          {dbLive && notifications.length > 0 && (
            <MarkAllReadButton />
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {!dbLive ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">Database Offline</p>
              <p className="text-xs text-muted-foreground">Connect MySQL to view notifications.</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <BellOff className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground">You're all caught up! System alerts will appear here.</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif: any) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors ${!notif.isRead ? "bg-primary/5" : ""}`}
                >
                  <div className="mt-0.5">
                    <div className={`h-2 w-2 rounded-full mt-1 ${!notif.isRead ? "bg-primary" : "bg-transparent"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${TYPE_COLORS[notif.type] ?? TYPE_COLORS.INFO}`}>
                        {notif.type}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notif.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <p className="text-sm font-medium mt-0.5">{notif.title}</p>
                    {notif.message && (
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                    )}
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
