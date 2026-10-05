"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Play, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TripActionsProps {
  tripId: string;
  tripNumber: string;
  status: string;
}

const NEXT_STATUS: Record<string, string> = {
  DRAFT: "ASSIGNED",
  ASSIGNED: "STARTED",
  STARTED: "RUNNING",
  RUNNING: "COMPLETED",
};

export function TripActions({ tripId, tripNumber, status }: TripActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Trip ${tripNumber} → ${newStatus}`);
        router.refresh();
      } else {
        toast.error("Failed to update trip status");
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStatus = NEXT_STATUS[status];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7" disabled={loading}>
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-xs">
        {nextStatus && (
          <DropdownMenuItem onClick={() => handleStatusChange(nextStatus)}>
            <Play className="h-3.5 w-3.5 mr-2 text-emerald-500" />
            Mark as {nextStatus}
          </DropdownMenuItem>
        )}
        {status !== "CANCELLED" && status !== "COMPLETED" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleStatusChange("CANCELLED")} className="text-red-600">
              <XCircle className="h-3.5 w-3.5 mr-2" />
              Cancel Trip
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
