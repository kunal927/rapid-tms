import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { getOperationsExpensesData } from "@/lib/db/operations-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, Plus, Truck, Calendar } from "lucide-react";
import { AddExpenseDialog } from "@/components/operations/add-expense-dialog";

export default async function OperationsExpensesPage() {
  await requireAuth(["OPERATIONS_MANAGER", "SUPER_ADMIN"]);

  const { expenses, trips } = await getOperationsExpensesData();

  const activeTripOptions = trips.map(t => ({
    id: t.id,
    tripNumber: t.tripNumber,
    vehicleNumber: t.vehicle.vehicleNumber,
    driverName: t.driver.user.name,
  }));

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Operational Expenses & Reimbursements</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Log en-route tolls, parking, loading and unloading fees. Owner retains final disbursement approval.
          </p>
        </div>

        <AddExpenseDialog trips={activeTripOptions} />
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-2xs p-4">
          <p className="text-xs font-medium text-muted-foreground">Logged Trip Expenses</p>
          <p className="text-2xl font-bold text-foreground mt-1">₹{totalAmount.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Across {expenses.length} claims</p>
        </Card>

        <Card className="shadow-2xs p-4 border-amber-500/20 bg-amber-500/5">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Approval Queue</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">Owner Controlled</p>
          <p className="text-[10px] text-amber-600/80 mt-0.5">RBAC enforced security</p>
        </Card>

        <Card className="shadow-2xs p-4 border-blue-500/20 bg-blue-500/5">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Supported Categories</p>
          <p className="text-xs font-bold text-foreground mt-2">Toll • Parking • Loading • Unloading</p>
          <p className="text-[10px] text-blue-600/80 mt-1">On-duty operational costs</p>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card className="shadow-2xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" /> Submitted Expense Claims ({expenses.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {expenses.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-xs">
              No operational expenses logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold">Amount</th>
                    <th className="p-3 font-semibold">Trip Number</th>
                    <th className="p-3 font-semibold">Vehicle</th>
                    <th className="p-3 font-semibold">Driver</th>
                    <th className="p-3 font-semibold">Paid By</th>
                    <th className="p-3 font-semibold">Remarks / Location</th>
                    <th className="p-3 font-semibold">Date Logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-muted/20">
                      <td className="p-3 font-semibold">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {(exp as any).category ?? (exp as any).expenseType ?? "EXPENSE"}
                        </Badge>
                      </td>
                      <td className="p-3 font-bold text-amber-600">
                        ₹{Number(exp.amount).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-foreground">{exp.trip.tripNumber}</span>
                      </td>
                      <td className="p-3 text-muted-foreground">{exp.trip.vehicle.vehicleNumber}</td>
                      <td className="p-3 text-muted-foreground">{exp.trip.driver.user.name}</td>
                      <td className="p-3 text-muted-foreground">{(exp as any).paidBy ?? "DRIVER"}</td>
                      <td className="p-3 text-muted-foreground max-w-xs truncate">{(exp as any).description ?? (exp as any).notes ?? "-"}</td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(exp.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
