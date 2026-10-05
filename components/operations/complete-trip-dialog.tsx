"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CompleteTripDialogProps {
  tripId: string;
  tripNumber: string;
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  failedOrders: number;
  trigger?: React.ReactNode;
}

export function CompleteTripDialog({
  tripId,
  tripNumber,
  totalOrders,
  deliveredOrders,
  pendingOrders,
  failedOrders,
  trigger,
}: CompleteTripDialogProps) {
  const [open, setOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const hasIncompleteOrders = pendingOrders > 0 || failedOrders > 0;

  const handleComplete = async () => {
    if (hasIncompleteOrders && !remarks.trim()) {
      toast.error("Please enter a remark explaining incomplete or failed deliveries.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/operations/trips/${tripId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks: remarks.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Failed to complete trip");
      }

      toast.success(`Trip ${tripNumber} marked as COMPLETED!`);
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to complete trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-600/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Complete Trip
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Complete Trip: {tripNumber}
          </DialogTitle>
          <DialogDescription>
            Review the final fulfillment summary before marking this trip as finished.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Summary Stats Grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="rounded-lg bg-muted/60 p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total</p>
              <p className="text-base font-bold">{totalOrders}</p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-2.5">
              <p className="text-[10px] uppercase font-semibold">Delivered</p>
              <p className="text-base font-bold">{deliveredOrders}</p>
            </div>
            <div className="rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 p-2.5">
              <p className="text-[10px] uppercase font-semibold">Pending</p>
              <p className="text-base font-bold">{pendingOrders}</p>
            </div>
            <div className="rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 p-2.5">
              <p className="text-[10px] uppercase font-semibold">Failed</p>
              <p className="text-base font-bold">{failedOrders}</p>
            </div>
          </div>

          {hasIncompleteOrders && (
            <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300 py-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-xs">
                There are {pendingOrders + failedOrders} incomplete or failed order(s). A remark is required before completing.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Completion Remarks {hasIncompleteOrders && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              placeholder={hasIncompleteOrders ? "Reason for pending/failed packages (e.g., customer unavailable, door locked)..." : "Optional notes regarding this trip completion..."}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              rows={3}
              className="text-xs"
            />
          </div>

          <div className="text-[11px] text-muted-foreground rounded-lg bg-muted/40 p-2.5">
            Upon completion, the assigned vehicle and driver will automatically be set back to <strong>AVAILABLE</strong> status.
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Confirm Completion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
