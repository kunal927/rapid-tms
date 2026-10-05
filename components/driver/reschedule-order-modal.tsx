"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarClock, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RescheduleOrderModalProps {
  orderId: string;
  orderNumber: string;
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
}

export function RescheduleOrderModal({
  orderId,
  orderNumber,
  onSuccess,
  triggerButton,
}: RescheduleOrderModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [nextDate, setNextDate] = useState(tomorrow);
  const [reason, setReason] = useState("Customer requested next-day delivery");
  const [remarks, setRemarks] = useState("");

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/driver/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "RESCHEDULED",
          rescheduleDate: nextDate,
          failureReason: reason,
          remarks: remarks.trim() || reason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reschedule order");
      }

      toast.info(`Order ${orderNumber} Rescheduled`, {
        description: `Next delivery attempt scheduled for ${nextDate}`,
      });

      setOpen(false);
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to reschedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            size="sm"
            variant="outline"
            className="w-full text-amber-600 border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-950/20 font-semibold h-11 text-xs rounded-xl touch-manipulation flex items-center justify-center gap-2"
          >
            <CalendarClock className="h-4 w-4" /> Reschedule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md w-full p-4 sm:p-6 rounded-2xl">
        <DialogHeader className="text-left pb-2 border-b">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-base">
            <CalendarClock className="h-5 w-5" />
            <DialogTitle className="text-base font-bold text-foreground">
              Reschedule Delivery - {orderNumber}
            </DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Plan next delivery attempt based on customer preference or operational schedule.
          </p>
        </DialogHeader>

        <form onSubmit={handleReschedule} className="space-y-4 pt-2">
          {/* Next Attempt Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Next Attempt Date</Label>
            <Input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              required
              className="h-10 text-xs"
            />
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Reschedule Reason</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer out of station, requested delivery tomorrow"
              required
              className="h-10 text-xs"
            />
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Additional Remarks</Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Call before coming in evening shift"
              rows={2}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-2 sm:pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-12 text-sm rounded-xl touch-manipulation shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CalendarClock className="h-4 w-4" /> Confirm Reschedule
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
