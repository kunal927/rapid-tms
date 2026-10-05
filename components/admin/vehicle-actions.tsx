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
import { MoreHorizontal, Edit, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface VehicleActionsProps {
  vehicleId: string;
  vehicleNumber: string;
  status: string;
}

export function VehicleActions({ vehicleId, vehicleNumber, status }: VehicleActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status === "INACTIVE" ? "AVAILABLE" : "INACTIVE" }),
      });
      if (res.ok) {
        toast.success(`Vehicle ${vehicleNumber} ${status === "INACTIVE" ? "activated" : "deactivated"}`);
        router.refresh();
      } else {
        toast.error("Failed to update vehicle status");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem className="gap-2 text-sm cursor-pointer" onClick={() => router.push(`/admin/vehicles/${vehicleId}/edit`)}>
          <Edit className="h-3.5 w-3.5" /> Edit Vehicle
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-sm cursor-pointer" onClick={handleToggleStatus} disabled={loading}>
          <Power className="h-3.5 w-3.5" />
          {status === "INACTIVE" ? "Activate" : "Deactivate"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
