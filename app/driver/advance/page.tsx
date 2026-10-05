import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { resolveDriverContext, getDriverAdvances, getDriverCurrentTrip } from "@/lib/db/driver-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { RequestAdvanceSheet } from "@/components/driver/request-advance-sheet";

export default async function DriverAdvancePage() {
  const session = await requireAuth(["DRIVER", "SUPER_ADMIN", "OPERATIONS_MANAGER"]);
  const driverContext = await resolveDriverContext(session.id, session.driverId);
  const data = await getDriverAdvances(driverContext.id);
  const activeTrip = await getDriverCurrentTrip(driverContext.id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            My Route Advances
          </h1>
          <p className="text-xs text-muted-foreground">
            Cash advances for fuel, tolls & trip mobilization
          </p>
        </div>

        <RequestAdvanceSheet currentTripId={activeTrip?.id} />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <Card className="shadow-2xs p-3.5 rounded-xl border bg-primary/5 border-primary/20">
          <span className="text-[10px] font-semibold text-muted-foreground block">
            Approved Advances
          </span>
          <span className="text-xl font-extrabold text-primary mt-0.5 block">
            ₹{data.approvedTotal.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">Adjusted in payout</span>
        </Card>

        <Card className="shadow-2xs p-3.5 rounded-xl border bg-amber-500/5 border-amber-500/20">
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 block">
            Pending Approval
          </span>
          <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 block">
            ₹{data.pendingTotal.toFixed(2)}
          </span>
          <span className="text-[10px] text-amber-600">Under review</span>
        </Card>
      </div>

      {/* Advance History List */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Advance Requests History
        </h2>

        {data.advances.length === 0 ? (
          <Card className="p-8 text-center shadow-2xs rounded-2xl">
            <CreditCard className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-foreground">No Advance History</h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs mx-auto">
              You haven't requested any route advance yet. Use the button above if you need route mobilization funds.
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {data.advances.map((adv) => (
              <Card key={adv.id} className="shadow-2xs rounded-xl p-3.5 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-foreground">
                        {adv.tripNumber}
                      </span>
                      <Badge
                        className={`text-[9px] font-bold px-1.5 py-0.2 ${
                          adv.status === "APPROVED"
                            ? "bg-emerald-600 text-white"
                            : adv.status === "REJECTED"
                            ? "bg-rose-600 text-white"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        {adv.status}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Mode: {adv.paymentMode}
                    </span>
                  </div>

                  <span className="text-base font-extrabold text-foreground">
                    ₹{adv.amount.toFixed(2)}
                  </span>
                </div>

                {adv.notes && (
                  <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                    {adv.notes}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                  <span>
                    Requested:{" "}
                    {new Date(adv.requestDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {adv.status === "REQUESTED" && (
                    <span className="text-amber-600 font-semibold flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> Pending Approval
                    </span>
                  )}
                  {adv.status === "APPROVED" && (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Disbursed
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
