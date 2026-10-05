"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  CheckCircle,
  Package,
  Receipt,
  Loader2,
  Gauge,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface DriverTripActionsProps {
  tripId: string;
  tripNumber: string;
  status: string;
  currentStartKm?: number | null;
  totalOrders: number;
  deliveredOrders: number;
  failedOrders: number;
  pendingOrders: number;
}

export function DriverTripActions({
  tripId,
  tripNumber,
  status,
  currentStartKm,
  totalOrders,
  deliveredOrders,
  failedOrders,
  pendingOrders,
}: DriverTripActionsProps) {
  const router = useRouter();

  // Start Trip State
  const [startOpen, setStartOpen] = useState(false);
  const [startKm, setStartKm] = useState(String(currentStartKm || "34120"));
  const [startNotes, setStartNotes] = useState("");
  const [starting, setStarting] = useState(false);

  // Complete Trip State
  const [completeOpen, setCompleteOpen] = useState(false);
  const [endKm, setEndKm] = useState(String((currentStartKm || 34120) + 45));
  const [completeNotes, setCompleteNotes] = useState("");
  const [completing, setCompleting] = useState(false);

  const handleStartTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setStarting(true);

    try {
      const res = await fetch("/api/driver/trip/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          startKm: Number(startKm),
          notes: startNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to start trip");
      }

      toast.success(`Trip ${tripNumber} Started!`, {
        description: "Vehicle and driver status updated to ON_TRIP. Orders ready for delivery.",
      });

      setStartOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to start trip");
    } finally {
      setStarting(false);
    }
  };

  const handleCompleteTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompleting(true);

    try {
      const res = await fetch("/api/driver/trip/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          endKm: Number(endKm),
          notes: completeNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to complete trip");
      }

      toast.success(`Trip ${tripNumber} Completed!`, {
        description: `Delivered ${deliveredOrders}/${totalOrders} orders. Vehicle status returned to AVAILABLE.`,
      });

      setCompleteOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to complete trip");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* If ASSIGNED or DRAFT -> Show START TRIP */}
      {(status === "ASSIGNED" || status === "DRAFT") && (
        <Dialog open={startOpen} onOpenChange={setStartOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-sm rounded-xl touch-manipulation shadow-md flex items-center justify-center gap-2"
            >
              <Play className="h-5 w-5 fill-current" /> START TRIP NOW
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md w-full p-4 sm:p-6 rounded-2xl">
            <DialogHeader className="text-left pb-2 border-b">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
                <Play className="h-5 w-5 fill-current" />
                <DialogTitle className="text-base font-bold text-foreground">
                  Start Trip {tripNumber}
                </DialogTitle>
              </div>
              <p className="text-xs text-muted-foreground">
                Confirm departure from depot. Status will become RUNNING and vehicle will be locked ON_TRIP.
              </p>
            </DialogHeader>

            <form onSubmit={handleStartTrip} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-muted-foreground" /> Initial Odometer Reading (Start KM)
                </Label>
                <Input
                  type="number"
                  value={startKm}
                  onChange={(e) => setStartKm(e.target.value)}
                  placeholder="e.g. 34120"
                  required
                  className="h-10 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Pre-Trip Departure Notes</Label>
                <Textarea
                  value={startNotes}
                  onChange={(e) => setStartNotes(e.target.value)}
                  placeholder="e.g. Vehicle tyres & fuel checked, manifest verified."
                  rows={2}
                  className="text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="submit"
                  disabled={starting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-sm rounded-xl touch-manipulation shadow-md flex items-center justify-center gap-2"
                >
                  {starting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Starting Trip...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" /> Confirm Start
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* If RUNNING or STARTED -> Show Action Grid */}
      {(status === "RUNNING" || status === "STARTED") && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Link href="/driver/orders">
              <Button
                variant="outline"
                className="w-full h-11 text-xs font-bold rounded-xl border-primary/30 text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5"
              >
                <Package className="h-4 w-4" /> VIEW ORDERS ({totalOrders})
              </Button>
            </Link>

            <Link href="/driver/expenses">
              <Button
                variant="outline"
                className="w-full h-11 text-xs font-bold rounded-xl border-amber-500/30 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 flex items-center justify-center gap-1.5"
              >
                <Receipt className="h-4 w-4" /> ADD EXPENSE
              </Button>
            </Link>
          </div>

          {/* COMPLETE TRIP BUTTON */}
          <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 text-sm rounded-xl touch-manipulation shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" /> COMPLETE TRIP
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-full p-4 sm:p-6 rounded-2xl">
              <DialogHeader className="text-left pb-2 border-b">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-base">
                  <CheckCircle className="h-5 w-5" />
                  <DialogTitle className="text-base font-bold text-foreground">
                    Complete Trip {tripNumber}
                  </DialogTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Finalize all deliveries, record closing odometer, and submit trip for settlement.
                </p>
              </DialogHeader>

              <form onSubmit={handleCompleteTrip} className="space-y-4 pt-2">
                {/* Summary Box */}
                <div className="bg-muted/40 p-3 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Consignments:</span>
                    <span className="font-bold">{totalOrders}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Delivered Orders:</span>
                    <span>{deliveredOrders}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Failed / Exception Orders:</span>
                    <span>{failedOrders}</span>
                  </div>
                  {pendingOrders > 0 && (
                    <div className="flex items-center gap-1.5 text-amber-600 font-bold pt-1 border-t text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{pendingOrders} orders are still pending delivery!</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-muted-foreground" /> Closing Odometer Reading (End KM)
                  </Label>
                  <Input
                    type="number"
                    value={endKm}
                    onChange={(e) => setEndKm(e.target.value)}
                    placeholder="e.g. 34185"
                    required
                    className="h-10 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Trip Completion Remarks</Label>
                  <Textarea
                    value={completeNotes}
                    onChange={(e) => setCompleteNotes(e.target.value)}
                    placeholder="e.g. All consignments handled. Returned to depot safely."
                    rows={2}
                    className="text-xs"
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="submit"
                    disabled={completing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 text-sm rounded-xl touch-manipulation shadow-md flex items-center justify-center gap-2"
                  >
                    {completing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Finalizing Trip...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" /> Confirm & Complete Trip
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* If COMPLETED */}
      {status === "COMPLETED" && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" /> This trip is completed and submitted for settlement.
        </div>
      )}
    </div>
  );
}
