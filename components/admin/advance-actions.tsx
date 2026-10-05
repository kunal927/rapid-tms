"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AdvanceActionsProps {
  advanceId: string;
  status: string;
}

export function AdvanceActions({ advanceId, status }: AdvanceActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const markRecovered = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/advances/${advanceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RECOVERED" }),
      });
      if (res.ok) {
        toast.success("Advance marked as settled/recovered");
        router.refresh();
      } else {
        toast.error("Failed to update advance");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteAdvance = async () => {
    if (!confirm("Are you sure you want to delete this advance record?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/advances/${advanceId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Advance record deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete advance");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7" disabled={loading}>
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-xs">
        {status !== "RECOVERED" && (
          <DropdownMenuItem onClick={markRecovered}>
            <CheckCheck className="h-3.5 w-3.5 mr-2 text-blue-500" />
            Mark Settled / Recovered
          </DropdownMenuItem>
        )}
        {status !== "RECOVERED" && <DropdownMenuSeparator />}
        <DropdownMenuItem onClick={deleteAdvance} className="text-red-600 focus:text-red-600">
          <Trash2 className="h-3.5 w-3.5 mr-2" />
          Delete Record
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
