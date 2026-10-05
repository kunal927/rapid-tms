import { requireAuth } from "@/lib/auth/session";
import { getAttendance } from "@/lib/db/admin-service";
import { isDatabaseLive } from "@/lib/db/service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Clock, UserCheck, UserX, CalendarDays } from "lucide-react";

interface SearchParams { date?: string; month?: string; year?: string; page?: string }

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  ABSENT: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  HALF_DAY: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  ON_LEAVE: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
};

export default async function AttendancePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAuth(["SUPER_ADMIN"]);
  const params = await searchParams;
  const dbLive = await isDatabaseLive();

  const today = new Date();
  const dateParam = params.date ?? today.toISOString().slice(0, 10);
  const page = parseInt(params.page ?? "1", 10);

  let data: Awaited<ReturnType<typeof getAttendance>> = { records: [], total: 0, page: 1, totalPages: 1 };

  if (dbLive) {
    try {
      data = await getAttendance({ date: new Date(dateParam), page });
    } catch {}
  }

  const presentCount = data.records.filter(r => r.status === "PRESENT").length;
  const absentCount = data.records.filter(r => r.status === "ABSENT").length;
  const leaveCount = data.records.filter(r => r.status === "ON_LEAVE").length;
  const halfDayCount = data.records.filter(r => r.status === "HALF_DAY").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Attendance</h1>
          <p className="text-sm text-muted-foreground">Daily driver attendance records</p>
        </div>
        <form method="get" className="flex items-center gap-2">
          <input type="date" name="date" defaultValue={dateParam}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm" />
          <Button type="submit" size="sm" variant="outline">View</Button>
        </form>
      </div>

      {/* Date display */}
      <div className="flex items-center gap-2 text-sm">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">
          {new Date(dateParam).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Present", value: presentCount, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
          { label: "Absent", value: absentCount, icon: UserX, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/40" },
          { label: "On Leave", value: leaveCount, icon: Clock, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40" },
          { label: "Half Day", value: halfDayCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40" },
        ].map(item => (
          <div key={item.label} className={`rounded-xl border p-3 bg-card`}>
            <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mb-2`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <p className="text-lg font-bold">{dbLive ? item.value : "—"}</p>
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!dbLive ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Clock className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">Database Offline</p>
            </div>
          ) : data.records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Clock className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">No attendance records for this date</p>
              <p className="text-xs text-muted-foreground">Records are created when drivers check in.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Driver</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Check In</TableHead>
                    <TableHead className="text-xs">Check Out</TableHead>
                    <TableHead className="text-xs">Hours</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.records.map(record => {
                    const hours = record.checkInTime && record.checkOutTime
                      ? ((new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime()) / 3600000).toFixed(1)
                      : null;
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <p className="text-sm font-medium">{record.driver.user.name}</p>
                          <p className="text-xs text-muted-foreground">{record.driver.driverCode}</p>
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(record.date).toLocaleDateString("en-IN")}
                        </TableCell>
                        <TableCell className="text-xs text-emerald-600 font-medium">
                          {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">{hours ? `${hours}h` : "—"}</TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[record.status]}`}>
                            {record.status.replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{record.notes ?? "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages}</p>
                  <div className="flex gap-2">
                    {data.page > 1 && <a href={`/admin/attendance?date=${dateParam}&page=${data.page - 1}`}><Button variant="outline" size="sm" className="h-7 text-xs">Previous</Button></a>}
                    {data.page < data.totalPages && <a href={`/admin/attendance?date=${dateParam}&page=${data.page + 1}`}><Button variant="outline" size="sm" className="h-7 text-xs">Next</Button></a>}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
