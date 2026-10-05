"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ExpenseActionsProps { expenseId: string; status: string }

export function ExpenseActions({ expenseId, status }: ExpenseActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/expenses/${expenseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Expense ${newStatus.toLowerCase()}`);
        router.refresh();
      } else {
        toast.error("Failed to update expense");
      }
    } finally {
      setLoading(false);
    }
  };

  if (status !== "PENDING") return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7" disabled={loading}>
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-xs">
        <DropdownMenuItem onClick={() => updateStatus("APPROVED")}>
          <CheckCircle className="h-3.5 w-3.5 mr-2 text-emerald-500" />
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateStatus("REJECTED")} className="text-red-600">
          <XCircle className="h-3.5 w-3.5 mr-2" />
          Reject
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
