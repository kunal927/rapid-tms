"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Power } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DriverActions({ driverId, driverName, status }: { driverId: string; driverName: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/drivers/${driverId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status === "INACTIVE" ? "ACTIVE" : "INACTIVE" }),
      });
      if (res.ok) { toast.success(`${driverName} ${status === "INACTIVE" ? "activated" : "deactivated"}`); router.refresh(); }
      else toast.error("Failed to update driver");
    } finally { setLoading(false); }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem className="gap-2 text-sm cursor-pointer" onClick={() => router.push(`/admin/drivers/${driverId}`)}>
          <Edit className="h-3.5 w-3.5" /> Edit Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-sm cursor-pointer" onClick={handleToggle} disabled={loading}>
          <Power className="h-3.5 w-3.5" /> {status === "INACTIVE" ? "Activate" : "Deactivate"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
