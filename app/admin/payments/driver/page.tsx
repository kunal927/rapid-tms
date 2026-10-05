import { requireAuth } from "@/lib/auth/session";
import { getDriverPayments, calculateDriverPayment, getAllDriversForSelect } from "@/lib/db/admin-service";
import { isDatabaseLive } from "@/lib/db/service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { CreditCard, TrendingUp, CheckCircle2, Clock, DollarSign } from "lucide-react";
import Link from "next/link";

interface SearchParams { driverId?: string; page?: string }

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  PROCESSED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
};

export default async function DriverPaymentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAuth(["SUPER_ADMIN"]);
  const params = await searchParams;
  const dbLive = await isDatabaseLive();

  const page = parseInt(params.page ?? "1", 10);

  let data: Awaited<ReturnType<typeof getDriverPayments>> = { payments: [], total: 0, page: 1, totalPages: 1 };
  let drivers: Awaited<ReturnType<typeof getAllDriversForSelect>> = [];

  if (dbLive) {
    try {
      [data, drivers] = await Promise.all([
        getDriverPayments({ page }),
        getAllDriversForSelect(),
      ]);
    } catch {}
  }

  const totalPaid = data.payments.filter(p => p.paymentStatus === "PAID").reduce((s, p) => s + Number(p.netPayment), 0);
  const totalPending = data.payments.filter(p => p.paymentStatus === "PENDING").reduce((s, p) => s + Number(p.netPayment), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Driver Payments</h1>
          <p className="text-sm text-muted-foreground">Manage and process driver payment settlements</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Records", value: data.total, icon: CreditCard, color: "text-blue-600" },
          { label: "Paid", value: data.payments.filter(p => p.paymentStatus === "PAID").length, icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Pending", value: data.payments.filter(p => p.paymentStatus === "PENDING").length, icon: Clock, color: "text-amber-600" },
          { label: "Total Paid Out", value: `₹${totalPaid.toLocaleString("en-IN")}`, icon: DollarSign, color: "text-indigo-600" },
        ].map(item => (
          <div key={item.label} className="rounded-xl border p-3 bg-card">
            <item.icon className={`h-5 w-5 mb-1 ${item.color}`} />
            <p className="text-lg font-bold">{dbLive ? item.value : "—"}</p>
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Payment Calculation Guide */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Payment Calculation Formula
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="space-y-1">
              <p className="font-semibold text-muted-foreground">Gross Earnings</p>
              <p className="font-mono">Delivered Orders × Rate/Order</p>
            </div>
            <div className="text-muted-foreground self-center">→</div>
            <div className="space-y-1">
              <p className="font-semibold text-muted-foreground">Net Payment</p>
              <p className="font-mono">Gross − Advance + Approved Expenses</p>
            </div>
            <div className="text-muted-foreground self-center">→</div>
            <div className="space-y-1">
              <p className="font-semibold text-emerald-600 font-semibold">Final Payout</p>
              <p className="font-mono">Net Payment − Already Paid</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Payment Records</CardTitle>
          <CardDescription className="text-xs">All driver payment settlements</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!dbLive ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <CreditCard className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">Database Offline</p>
              <p className="text-xs text-muted-foreground">Connect MySQL to view payment records.</p>
            </div>
          ) : data.payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <CreditCard className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">No payment records yet</p>
              <p className="text-xs text-muted-foreground">Payment records will appear once trips are completed.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Driver</TableHead>
                    <TableHead className="text-xs">Period</TableHead>
                    <TableHead className="text-xs">Orders</TableHead>
                    <TableHead className="text-xs">Rate</TableHead>
                    <TableHead className="text-xs">Gross</TableHead>
                    <TableHead className="text-xs">Advance</TableHead>
                    <TableHead className="text-xs">Expenses</TableHead>
                    <TableHead className="text-xs">Net Pay</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.payments.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{payment.driver.user.name}</p>
                          <p className="text-xs text-muted-foreground">{payment.driver.driverCode}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(payment.periodStart).toLocaleDateString("en-IN")}
                        {" — "}
                        {new Date(payment.periodEnd).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{payment.totalOrdersDelivered}</TableCell>
                      <TableCell className="text-xs">₹{Number(payment.perOrderRate)}</TableCell>
                      <TableCell className="text-xs font-semibold text-blue-600">
                        ₹{Number(payment.grossEarnings).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-xs text-red-600">
                        −₹{Number(payment.totalAdvanceDeducted).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-xs text-emerald-600">
                        +₹{Number(payment.totalExpensesReimbursed).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm font-bold">
                        ₹{Number(payment.netPayment).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${PAYMENT_STATUS_COLORS[payment.paymentStatus]}`}>
                          {payment.paymentStatus}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Summary Row */}
              <div className="border-t px-4 py-3 bg-muted/30 flex flex-wrap gap-6 text-xs font-semibold">
                <span>Total Records: {data.total}</span>
                <span className="text-emerald-600">Total Paid: ₹{totalPaid.toLocaleString("en-IN")}</span>
                <span className="text-amber-600">Pending: ₹{totalPending.toLocaleString("en-IN")}</span>
              </div>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages}</p>
                  <div className="flex gap-2">
                    {data.page > 1 && <a href={`/admin/payments/driver?page=${data.page - 1}`}><Button variant="outline" size="sm" className="h-7 text-xs">Previous</Button></a>}
                    {data.page < data.totalPages && <a href={`/admin/payments/driver?page=${data.page + 1}`}><Button variant="outline" size="sm" className="h-7 text-xs">Next</Button></a>}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
