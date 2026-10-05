"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function MarkAllReadButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMarkAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications/mark-all-read", { method: "POST" });
      if (res.ok) {
        toast.success("All notifications marked as read");
        router.refresh();
      } else {
        toast.error("Failed to mark notifications");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={handleMarkAll} disabled={loading} className="gap-1.5">
      <CheckCheck className="h-3.5 w-3.5" />
      {loading ? "Marking..." : "Mark All Read"}
    </Button>
  );
}
