"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Clock,
  CheckCircle2,
  LogOut,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface AttendanceClockProps {
  todayRecord: {
    id: string;
    date: Date;
    status: string;
    checkInTime: Date | null;
    checkOutTime: Date | null;
    notes?: string | null;
  } | null;
}

export function AttendanceClock({ todayRecord }: AttendanceClockProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  const isCheckedIn = Boolean(todayRecord?.checkInTime);
  const isCheckedOut = Boolean(todayRecord?.checkOutTime);

  const handleAction = async (action: "CHECK_IN" | "CHECK_OUT") => {
    setLoading(true);

    try {
      let latitude: number | undefined;
      let longitude: number | undefined;

      // Try capturing GPS coordinates without blocking
      if (typeof window !== "undefined" && "geolocation" in navigator) {
        try {
          await new Promise<void>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                latitude = pos.coords.latitude;
                longitude = pos.coords.longitude;
                resolve();
              },
              () => resolve(),
              { timeout: 3000 }
            );
          });
        } catch {
          // Non-blocking
        }
      }

      const res = await fetch("/api/driver/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          notes,
          latitude,
          longitude,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Attendance update failed");
      }

      toast.success(action === "CHECK_IN" ? "Checked In Successfully!" : "Checked Out Successfully!", {
        description: action === "CHECK_IN" ? "Shift attendance recorded at depot." : "Shift duty completed.",
      });

      setNotes("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-xs border-2 border-primary/20 overflow-hidden">
      <div className="bg-primary/5 p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-sm font-bold text-foreground">Today's Duty Shift</h2>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <Badge
          className={`text-xs font-bold ${
            isCheckedOut
              ? "bg-slate-600 text-white"
              : isCheckedIn
              ? "bg-emerald-600 text-white"
              : "bg-amber-600 text-white"
          }`}
        >
          {isCheckedOut
            ? "SHIFT COMPLETED"
            : isCheckedIn
            ? "ON DUTY"
            : "NOT CHECKED IN"}
        </Badge>
      </div>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Status Time Display */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-muted/30 p-3 rounded-xl border">
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Check-In Time
            </span>
            <span className="text-base font-bold text-foreground mt-0.5 block">
              {todayRecord?.checkInTime
                ? new Date(todayRecord.checkInTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--:--"}
            </span>
          </div>

          <div className="bg-muted/30 p-3 rounded-xl border">
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Check-Out Time
            </span>
            <span className="text-base font-bold text-foreground mt-0.5 block">
              {todayRecord?.checkOutTime
                ? new Date(todayRecord.checkOutTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--:--"}
            </span>
          </div>
        </div>

        {/* Optional Notes */}
        {!isCheckedOut && (
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Shift remarks (e.g. Mahipalpur depot gate)"
            className="h-10 text-xs"
          />
        )}

        {/* Action Button */}
        {!isCheckedIn ? (
          <Button
            onClick={() => handleAction("CHECK_IN")}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-13 text-sm rounded-xl touch-manipulation shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" /> CLOCK IN / START SHIFT
              </>
            )}
          </Button>
        ) : !isCheckedOut ? (
          <Button
            onClick={() => handleAction("CHECK_OUT")}
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold h-13 text-sm rounded-xl touch-manipulation shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogOut className="w-5 h-5" /> CLOCK OUT / END SHIFT
              </>
            )}
          </Button>
        ) : (
          <div className="p-3 bg-muted text-center rounded-xl text-xs text-muted-foreground font-medium">
            Today's duty shift is complete. Have a good rest!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
