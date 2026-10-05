import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { resolveDriverContext, getDriverExpenses, getDriverCurrentTrip } from "@/lib/db/driver-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Plus, Clock, CheckCircle2, XCircle } from "lucide-react";
import { AddDriverExpenseSheet } from "@/components/driver/add-driver-expense-sheet";

export default async function DriverExpensesPage() {
  const session = await requireAuth(["DRIVER", "SUPER_ADMIN", "OPERATIONS_MANAGER"]);
  const driverContext = await resolveDriverContext(session.id, session.driverId);
  const expenses = await getDriverExpenses(driverContext.id);
  const activeTrip = await getDriverCurrentTrip(driverContext.id);

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedTotal = expenses
    .filter((e) => e.status === "APPROVED")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            My En-Route Expenses
          </h1>
          <p className="text-xs text-muted-foreground">
            Tolls, fuel, parking and repair receipts
          </p>
        </div>

        <AddDriverExpenseSheet currentTripId={activeTrip?.id} />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <Card className="shadow-2xs p-3.5 rounded-xl border">
          <span className="text-[10px] font-semibold text-muted-foreground block">
            Total Logged
          </span>
          <span className="text-lg font-bold text-foreground mt-0.5 block">
            ₹{totalAmount.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">{expenses.length} claims</span>
        </Card>

        <Card className="shadow-2xs p-3.5 rounded-xl border bg-emerald-500/5 border-emerald-500/20">
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block">
            Reimbursed / Approved
          </span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            ₹{approvedTotal.toFixed(2)}
          </span>
          <span className="text-[10px] text-emerald-600">Settled in ledger</span>
        </Card>
      </div>

      {/* Expenses History List */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Expense History
        </h2>

        {expenses.length === 0 ? (
          <Card className="p-8 text-center shadow-2xs rounded-2xl">
            <Receipt className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-foreground">No Expenses Found</h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs mx-auto">
              You haven't logged any route expenses yet. Use the "Log Expense" button above to claim tolls, fuel or parking bills.
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {expenses.map((exp) => (
              <Card key={exp.id} className="shadow-2xs rounded-xl p-3.5 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">
                        {exp.category}
                      </span>
                      <Badge
                        className={`text-[9px] font-bold px-1.5 py-0.2 ${
                          exp.status === "APPROVED"
                            ? "bg-emerald-600 text-white"
                            : exp.status === "REJECTED"
                            ? "bg-rose-600 text-white"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        {exp.status}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Trip: {exp.tripNumber}
                    </span>
                  </div>

                  <span className="text-base font-extrabold text-foreground">
                    ₹{exp.amount.toFixed(2)}
                  </span>
                </div>

                {exp.notes && (
                  <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                    {exp.notes}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                  <span>
                    {new Date(exp.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {exp.status === "PENDING" && (
                    <span className="text-amber-600 font-semibold flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> Awaiting Owner Review
                    </span>
                  )}
                  {exp.status === "APPROVED" && (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Approved
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
