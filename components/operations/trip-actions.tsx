"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Play, CheckCircle2, XCircle, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CompleteTripDialog } from "./complete-trip-dialog";

interface TripActionsProps {
  trip: {
    id: string;
    tripNumber: string;
    status: string;
    calculatedTotalOrders?: number;
    calculatedDeliveredOrders?: number;
    calculatedPendingOrders?: number;
    calculatedFailedOrders?: number;
    totalOrders: number;
    deliveredOrders: number;
    failedOrders: number;
  };
}

export function TripActions({ trip }: TripActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const total = trip.calculatedTotalOrders ?? trip.totalOrders ?? 0;
  const delivered = trip.calculatedDeliveredOrders ?? trip.deliveredOrders ?? 0;
  const failed = trip.calculatedFailedOrders ?? trip.failedOrders ?? 0;
  const pending = trip.calculatedPendingOrders ?? Math.max(0, total - delivered - failed);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/operations/trips/${trip.id}/start`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Failed to start trip");
      }
      toast.success(`Trip ${trip.tripNumber} started successfully!`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to start trip");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const reason = prompt("Enter cancellation reason for this trip:");
    if (!reason) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/operations/trips/${trip.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Failed to cancel trip");
      }
      toast.success(`Trip ${trip.tripNumber} cancelled.`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to cancel trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <Link href={`/operations/trips/${trip.id}`}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>

      {(trip.status === "ASSIGNED" || trip.status === "DRAFT") && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleStart}
          disabled={loading}
          className="h-8 gap-1 text-xs text-blue-600 border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-950/30"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          Start
        </Button>
      )}

      {(trip.status === "RUNNING" || trip.status === "STARTED") && (
        <CompleteTripDialog
          tripId={trip.id}
          tripNumber={trip.tripNumber}
          totalOrders={total}
          deliveredOrders={delivered}
          pendingOrders={pending}
          failedOrders={failed}
        />
      )}

      {trip.status !== "COMPLETED" && trip.status !== "CANCELLED" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/operations/trips/${trip.id}`}>
              <DropdownMenuItem className="gap-2 text-xs">
                <Eye className="h-3.5 w-3.5" /> Full Trip View
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleCancel}
              className="gap-2 text-xs text-red-600 focus:text-red-600 dark:text-red-400"
            >
              <XCircle className="h-3.5 w-3.5" /> Cancel Trip
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
