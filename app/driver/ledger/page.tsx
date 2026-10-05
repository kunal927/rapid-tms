import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { resolveDriverContext, getDriverLedger } from "@/lib/db/driver-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowUpRight, ArrowDownLeft, Calendar } from "lucide-react";

export default async function DriverLedgerPage() {
  const session = await requireAuth(["DRIVER", "SUPER_ADMIN", "OPERATIONS_MANAGER"]);
  const driverContext = await resolveDriverContext(session.id, session.driverId);
  const ledger = await getDriverLedger(driverContext.id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          Driver Ledger Statement
        </h1>
        <p className="text-xs text-muted-foreground">
          Personal ledger transaction credits, debits and running balance
        </p>
      </div>

      {/* Ledger Cards */}
      {ledger.length === 0 ? (
        <Card className="p-8 text-center shadow-2xs rounded-2xl">
          <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-foreground">No Ledger Entries</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your transactions will appear here once trips are completed or advances disbursed.
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {ledger.map((entry) => {
            const isCredit = entry.credit > 0;
            return (
              <Card key={entry.id} className="shadow-2xs rounded-xl p-3.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-foreground block leading-tight">
                      {entry.description}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(entry.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    {isCredit ? (
                      <span className="text-sm font-black text-emerald-600 flex items-center justify-end gap-0.5">
                        <ArrowDownLeft className="w-3.5 h-3.5" /> +₹{entry.credit.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm font-black text-rose-600 flex items-center justify-end gap-0.5">
                        <ArrowUpRight className="w-3.5 h-3.5" /> -₹{entry.debit.toFixed(2)}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      Bal: ₹{entry.balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
