"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Truck, Car, Users, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Quick Add
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs">Create New</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/admin/trips?new=1")} className="gap-2 text-sm cursor-pointer">
          <Truck className="h-4 w-4" /> New Trip
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/admin/vehicles?new=1")} className="gap-2 text-sm cursor-pointer">
          <Car className="h-4 w-4" /> Add Vehicle
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/admin/drivers?new=1")} className="gap-2 text-sm cursor-pointer">
          <Users className="h-4 w-4" /> Add Driver
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/admin/dpds?new=1")} className="gap-2 text-sm cursor-pointer">
          <Building2 className="h-4 w-4" /> Add DPD
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
