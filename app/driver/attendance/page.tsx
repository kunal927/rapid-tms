import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { resolveDriverContext, getDriverAttendance } from "@/lib/db/driver-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Clock, Calendar } from "lucide-react";
import { AttendanceClock } from "@/components/driver/attendance-clock";

export default async function DriverAttendancePage() {
  const session = await requireAuth(["DRIVER", "SUPER_ADMIN", "OPERATIONS_MANAGER"]);
  const driverContext = await resolveDriverContext(session.id, session.driverId);
  const data = await getDriverAttendance(driverContext.id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          Daily Attendance
        </h1>
        <p className="text-xs text-muted-foreground">
          Shift clock-in, duty check-out and work history
        </p>
      </div>

      {/* Primary Shift Clock Card */}
      <AttendanceClock todayRecord={data.todayRecord} />

      {/* Attendance History */}
      <div className="space-y-2.5 pt-2">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Recent Shift Logs
        </h2>

        {data.history.length === 0 ? (
          <Card className="p-8 text-center shadow-2xs rounded-2xl">
            <CalendarCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-foreground">No Attendance History</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Clock-in daily to build your verified shift record.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {data.history.map((record) => (
              <Card key={record.id} className="shadow-2xs rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {new Date(record.date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <Badge
                    className={`text-[9px] font-bold px-1.5 py-0.2 ${
                      record.status === "PRESENT"
                        ? "bg-emerald-600 text-white"
                        : record.status === "HALF_DAY"
                        ? "bg-amber-600 text-white"
                        : "bg-rose-600 text-white"
                    }`}
                  >
                    {record.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-0.5">
                  <div>
                    <span>In: </span>
                    <span className="font-semibold text-foreground">
                      {record.checkInTime
                        ? new Date(record.checkInTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </span>
                  </div>
                  <div>
                    <span>Out: </span>
                    <span className="font-semibold text-foreground">
                      {record.checkOutTime
                        ? new Date(record.checkOutTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </span>
                  </div>
                </div>

                {record.notes && (
                  <p className="text-[10px] text-muted-foreground bg-muted/30 p-1.5 rounded-lg truncate">
                    {record.notes}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
