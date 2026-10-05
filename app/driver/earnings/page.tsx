import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { resolveDriverContext, getDriverEarnings } from "@/lib/db/driver-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  PackageCheck,
  TrendingUp,
  Receipt,
  CreditCard,
  CheckCircle2,
  Info,
} from "lucide-react";

export default async function DriverEarningsPage() {
  const session = await requireAuth(["DRIVER", "SUPER_ADMIN", "OPERATIONS_MANAGER"]);
  const driverContext = await resolveDriverContext(session.id, session.driverId);
  const data = await getDriverEarnings(driverContext.id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          My Earnings & Payouts
        </h1>
        <p className="text-xs text-muted-foreground">
          Delivery payouts, deductions and net settlements
        </p>
      </div>

      {/* Main Net Balance Card */}
      <Card className="shadow-2xs rounded-2xl overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Net Payable Settlement
            </span>
            <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
              VERIFIED BY SYSTEM
            </Badge>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">
              ₹{data.netPayable.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">accumulated balance</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
            <div className="bg-muted/30 p-2.5 rounded-xl border">
              <span className="text-[10px] text-muted-foreground block">Disbursed / Paid</span>
              <span className="text-sm font-bold text-emerald-600 mt-0.5 block">
                ₹{data.totalPaid.toFixed(2)}
              </span>
            </div>
            <div className="bg-muted/30 p-2.5 rounded-xl border">
              <span className="text-[10px] text-muted-foreground block">Pending Transfer</span>
              <span className="text-sm font-bold text-amber-600 mt-0.5 block">
                ₹{data.pendingPayment.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Tabs: Today vs This Week */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid grid-cols-2 w-full h-11 p-1 rounded-xl">
          <TabsTrigger value="today" className="rounded-lg text-xs font-bold">
            Today's Breakdown
          </TabsTrigger>
          <TabsTrigger value="thisWeek" className="rounded-lg text-xs font-bold">
            This Week Summary
          </TabsTrigger>
        </TabsList>

        {/* Today Tab */}
        <TabsContent value="today" className="mt-3 space-y-3">
          <Card className="shadow-2xs rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between border-b pb-2">
              <span>Shift Calculation</span>
              <span className="text-primary font-mono">Rate: ₹{data.today.rate.toFixed(2)} / parcel</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Delivered Consignments ({data.today.delivered} × ₹{data.today.rate})
                </span>
                <span className="font-bold text-foreground">
                  +₹{data.today.gross.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-blue-600" />
                  Reimbursed Expenses (Tolls / Parking)
                </span>
                <span className="font-bold text-emerald-600">
                  +₹{data.today.expenses.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-rose-600" />
                  Route Cash Advance Deducted
                </span>
                <span className="font-bold text-rose-600">
                  -₹{data.today.advance.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t font-bold text-sm">
                <span className="text-foreground">Net Today's Earning</span>
                <span className="text-primary font-extrabold">
                  ₹{data.today.net.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* This Week Tab */}
        <TabsContent value="thisWeek" className="mt-3 space-y-3">
          <Card className="shadow-2xs rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between border-b pb-2">
              <span>Weekly Cumulative</span>
              <span className="text-primary font-mono">{data.thisWeek.delivered} total deliveries</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Gross Delivery Earnings</span>
                <span className="font-bold text-foreground">
                  +₹{data.thisWeek.gross.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Approved Trip Expenses</span>
                <span className="font-bold text-emerald-600">
                  +₹{data.thisWeek.expenses.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Total Advances Adjusted</span>
                <span className="font-bold text-rose-600">
                  -₹{data.thisWeek.advance.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t font-bold text-sm">
                <span className="text-foreground">Weekly Net Payout</span>
                <span className="text-primary font-extrabold">
                  ₹{data.thisWeek.net.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Notice */}
      <div className="bg-muted/40 p-3 rounded-xl border text-[11px] text-muted-foreground flex items-start gap-2">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <span>
          Earnings calculations are verified and audited by the transport management system. Bank settlement transfers are processed every Monday.
        </span>
      </div>
    </div>
  );
}
