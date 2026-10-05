import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { getOperationsAttendance } from "@/lib/db/operations-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Calendar, User, Search, Filter } from "lucide-react";

interface SearchParams {
  date?: string;
  driverId?: string;
}

export default async function OperationsAttendancePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAuth(["OPERATIONS_MANAGER", "SUPER_ADMIN"]);
  const params = await searchParams;

  const dateStr = params.date ?? new Date().toISOString().slice(0, 10);
  const { records, drivers } = await getOperationsAttendance({
    date: dateStr,
    driverId: params.driverId,
  });

  const presentCount = records.filter(r => r.status === "PRESENT").length;
  const absentCount = records.filter(r => r.status === "ABSENT").length;
  const leaveCount = records.filter(r => r.status === "ON_LEAVE" || r.status === "HALF_DAY").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Driver Attendance & Check-In Log</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Daily driver duty attendance, clock-in timestamps, and operational shift verification
        </p>
      </div>

      {/* Date Filter & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-2xs p-4 flex flex-col justify-center">
          <form method="GET" className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground">Attendance Date:</span>
            <div className="flex gap-2">
              <Input
                type="date"
                name="date"
                defaultValue={dateStr}
                className="h-9 text-xs"
              />
              <Button type="submit" size="sm" variant="secondary" className="h-9 text-xs">
                View
              </Button>
            </div>
          </form>
        </Card>

        <Card className="shadow-2xs p-4 text-center border-emerald-500/30 bg-emerald-500/5">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">PRESENT</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{presentCount}</p>
          <p className="text-[10px] text-emerald-600/80">Drivers on duty</p>
        </Card>

        <Card className="shadow-2xs p-4 text-center border-amber-500/30 bg-amber-500/5">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">LEAVE / HALF DAY</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">{leaveCount}</p>
          <p className="text-[10px] text-amber-600/80">Authorized absence</p>
        </Card>

        <Card className="shadow-2xs p-4 text-center border-red-500/30 bg-red-500/5">
          <p className="text-xs font-semibold text-red-700 dark:text-red-300">ABSENT</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{absentCount}</p>
          <p className="text-[10px] text-red-600/80">Unreported</p>
        </Card>
      </div>

      {/* Attendance Log Table */}
      <Card className="shadow-2xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Shift Attendance Roster ({new Date(dateStr).toLocaleDateString("en-IN", { dateStyle: "long" })})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {records.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-xs">
              No attendance entries logged for this date.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                    <th className="p-3 font-semibold">Driver Code</th>
                    <th className="p-3 font-semibold">Driver Name</th>
                    <th className="p-3 font-semibold">Mobile</th>
                    <th className="p-3 font-semibold">Check-In</th>
                    <th className="p-3 font-semibold">Check-Out</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {records.map(rec => (
                    <tr key={rec.id} className="hover:bg-muted/20">
                      <td className="p-3 font-semibold">{(rec.driver as any).driverCode ?? "DRV"}</td>
                      <td className="p-3 font-medium text-foreground">{rec.driver.user.name}</td>
                      <td className="p-3 text-muted-foreground">{rec.driver.user.phone ?? "-"}</td>
                      <td className="p-3 text-muted-foreground">
                        {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            rec.status === "PRESENT" ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10" :
                            rec.status === "ON_LEAVE" || rec.status === "HALF_DAY" ? "border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10" :
                            "border-red-500/40 text-red-700 dark:text-red-300 bg-red-500/10"
                          }`}
                        >
                          {rec.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{(rec as any).remarks ?? (rec as any).notes ?? "-"}</td>
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
