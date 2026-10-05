import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { OperationsReportsViewer } from "@/components/operations/reports-viewer";

export default async function OperationsReportsPage() {
  await requireAuth(["OPERATIONS_MANAGER", "SUPER_ADMIN"]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Operations Fleet & Dispatch Reports</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Audit daily dispatches, vehicle fleet utilization, driver completion ratios and delivery exception summaries
        </p>
      </div>

      <OperationsReportsViewer />
    </div>
  );
}
