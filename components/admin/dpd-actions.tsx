"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DpdActionsProps {
  dpdId: string;
  dpdName: string;
  isActive: boolean;
}

export function DpdActions({ dpdId, dpdName, isActive }: DpdActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dpds/${dpdId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        toast.success(`DPD "${dpdName}" ${!isActive ? "activated" : "deactivated"}`);
        router.refresh();
      } else {
        toast.error("Failed to update DPD status");
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
        <DropdownMenuItem onClick={handleToggle}>
          {isActive ? (
            <><PowerOff className="h-3.5 w-3.5 mr-2 text-red-500" />Deactivate</>
          ) : (
            <><Power className="h-3.5 w-3.5 mr-2 text-emerald-500" />Activate</>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
