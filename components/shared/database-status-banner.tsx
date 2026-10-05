"use client";

import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, CheckCircle2, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DatabaseStatusBannerProps {
  isLive: boolean;
}

export function DatabaseStatusBanner({ isLive }: DatabaseStatusBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (isLive) {
    return (
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            <strong>MySQL Connected:</strong> Prisma ORM is live and synchronized with MySQL database.
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDismissed(true)}
          className="h-5 w-5 text-emerald-700 hover:bg-emerald-500/20 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/25 px-4 py-2 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Database className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>
          <strong>Resilient Demo Mode Active:</strong> MySQL service is currently stopped or offline. The system is operating in high-fidelity mode with seeded real-world test data.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline font-mono text-[11px] bg-amber-500/20 px-1.5 py-0.5 rounded">
          Start MySQL80 & run npm run db:push
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDismissed(true)}
          className="h-5 w-5 text-amber-800 hover:bg-amber-500/20 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
