"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Power, PowerOff, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UserActionsProps {
  userId: string;
  userName: string;
  isActive: boolean;
  role: string;
}

export function UserActions({ userId, userName, isActive, role }: UserActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        toast.success(`${userName} ${!isActive ? "activated" : "deactivated"}`);
        router.refresh();
      } else {
        toast.error("Failed to update user status");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const newPassword = prompt(`Enter new password for ${userName}:`);
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetPassword: newPassword }),
      });
      if (res.ok) {
        toast.success(`Password reset for ${userName}`);
      } else {
        toast.error("Failed to reset password");
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
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleResetPassword}>
          <KeyRound className="h-3.5 w-3.5 mr-2 text-amber-500" />
          Reset Password
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
