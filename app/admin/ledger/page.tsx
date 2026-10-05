import { requireAuth } from "@/lib/auth/session";
import {
  getAllDriversForSelect,
  getDriverLedger,
  getMasterCompanyLedger,
  getAdminDashboardMetrics,
} from "@/lib/db/admin-service";
import { isDatabaseLive } from "@/lib/db/service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, DollarSign, Building2, User } from "lucide-react";
import Link from "next/link";

interface SearchParams {
  tab?: string;
  driverId?: string;
  page?: string;
}

export default async function LedgerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAuth(["SUPER_ADMIN"]);
  const params = await searchParams;
  const dbLive = await isDatabaseLive();

  const activeTab = params.tab ?? (params.driverId ? "driver" : "company");
  const driverId = params.driverId ?? "";
  const page = parseInt(params.page ?? "1", 10);

  let drivers: Awaited<ReturnType<typeof getAllDriversForSelect>> = [];
  let driverData: { entries: any[]; total: number; page: number; totalPages: number } = {
    entries: [],
    total: 0,
    page: 1,
    totalPages: 1,
  };
  let companyData: Awaited<ReturnType<typeof getMasterCompanyLedger>> = {
    transactions: [],
    total: 0,
    page: 1,
    totalPages: 1,
    totalCredit: 0,
    totalDebit: 0,
    netBalance: 0,
  };
  let metrics: Awaited<ReturnType<typeof getAdminDashboardMetrics>> | null = null;

  if (dbLive) {
    try {
      [drivers, companyData, metrics] = await Promise.all([
        getAllDriversForSelect(),
        getMasterCompanyLedger({ page }),
        getAdminDashboardMetrics(),
      ]);

      if (driverId) {
        driverData = await getDriverLedger(driverId, { page });
      }
    } catch {
      // fallback
    }
  }

  const selectedDriver = drivers.find((d: any) => d.id === driverId);

  // Driver calculations
  const driverTotalCredit = driverData.entries
    .filter(e => e.transactionType === "CREDIT")
    .reduce((s: number, e: any) => s + Number(e.amount), 0);
  const driverTotalDebit = driverData.entries
    .filter(e => e.transactionType === "DEBIT")
    .reduce((s: number, e: any) => s + Number(e.amount), 0);
  const driverCurrentBalance = driverData.entries.length > 0 ? Number(driverData.entries[0].balanceAfter) : 0;

  // Master company numbers matching the dashboard exactly
  const masterTotalCredit = metrics?.financial.totalCredit ?? companyData.totalCredit;
  const masterTotalDebit = metrics?.financial.totalDebit ?? companyData.totalDebit;
  const masterNetBalance = masterTotalCredit - masterTotalDebit;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Financial & Operating Ledger</h1>
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
              Automated Bookkeeping
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Complete financial records: Inward client payments, DPD settlements, fuel, maintenance & driver payouts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm" className="text-xs">Dashboard</Button>
          </Link>
          <Link href="/admin/expenses">
            <Button size="sm" variant="outline" className="text-xs text-red-600 border-red-200 hover:bg-red-50">
              View All Debits
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b pb-2">
        <Link
          href="/admin/ledger?tab=company"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "company"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Company Master Ledger
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${activeTab === "company" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-foreground"}`}>
            ₹{Math.round(masterTotalCredit).toLocaleString("en-IN")} Inflow
          </span>
        </Link>

        <Link
          href={`/admin/ledger?tab=driver${driverId ? `&driverId=${driverId}` : ""}`}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "driver"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <User className="h-4 w-4" />
          Driver Individual Ledger
          {selectedDriver && (
            <span className="text-[10px] font-mono bg-muted px-1.5 py-0.2 rounded">
              {selectedDriver.driverCode}
            </span>
          )}
        </Link>
      </div>

      {/* ─── TAB 1: COMPANY MASTER FINANCIAL LEDGER ─── */}
      {activeTab === "company" && (
        <div className="space-y-4">
          {/* Master KPI Row matching Dashboard exactly */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">Total Credit (Revenue & Inflow)</p>
                <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 mt-1.5">
                ₹{Math.round(masterTotalCredit).toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Client Invoices, DPD Advances & COD Handover</p>
            </div>

            <div className="rounded-xl border-2 border-red-200 bg-red-50/50 dark:bg-red-950/20 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-red-800 dark:text-red-400">Total Debit (Auto-Sum Outflow)</p>
                <ArrowUpRight className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600 mt-1.5">
                ₹{Math.round(masterTotalDebit).toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Maintenance + Fuel + Advances + Driver Payouts + Toll</p>
            </div>

            <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-primary">Net Operating Balance</p>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <p className={`text-2xl font-bold mt-1.5 ${masterNetBalance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                ₹{Math.round(Math.abs(masterNetBalance)).toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {masterNetBalance >= 0 ? "Operating Profit Surplus (+)" : "Operating Deficit (-)"}
              </p>
            </div>
          </div>

          {/* Master Double-Entry Transaction Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Master Double-Entry Financial Transactions</CardTitle>
              <CardDescription className="text-xs">
                Audited accounting ledger recording all money entering and leaving the company accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {companyData.transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm font-medium">No transactions recorded yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="text-xs font-semibold">Date</TableHead>
                        <TableHead className="text-xs font-semibold">Transaction #</TableHead>
                        <TableHead className="text-xs font-semibold">Entity Type</TableHead>
                        <TableHead className="text-xs font-semibold">Description / Remarks</TableHead>
                        <TableHead className="text-xs font-semibold">Type</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Credit Inflow</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Debit Outflow</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Balance After</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companyData.transactions.map(txn => (
                        <TableRow key={txn.id} className="hover:bg-muted/30">
                          <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                            {new Date(txn.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-xs font-mono font-medium">
                            {txn.transactionNumber}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span className="text-[10px] font-semibold uppercase tracking-wider bg-secondary px-2 py-0.5 rounded">
                              {txn.entityType}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs max-w-sm">
                            <p className="line-clamp-2">{txn.remarks}</p>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              txn.type === "CREDIT"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                            }`}>
                              {txn.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-right text-emerald-600 whitespace-nowrap">
                            {txn.type === "CREDIT" ? `+ ₹${Number(txn.amount).toLocaleString("en-IN")}` : "—"}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-right text-red-600 whitespace-nowrap">
                            {txn.type === "DEBIT" ? `- ₹${Number(txn.amount).toLocaleString("en-IN")}` : "—"}
                          </TableCell>
                          <TableCell className="text-sm font-bold text-right text-foreground whitespace-nowrap">
                            ₹{Number(txn.balanceAfter).toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── TAB 2: DRIVER INDIVIDUAL LEDGER ─── */}
      {activeTab === "driver" && (
        <div className="space-y-4">
          {/* Driver Selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Select Driver for Individual Ledger</CardTitle>
            </CardHeader>
            <CardContent>
              <form method="get" className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="tab" value="driver" />
                <Select name="driverId" defaultValue={driverId}>
                  <SelectTrigger className="max-w-xs h-9 text-xs">
                    <SelectValue placeholder="Choose a driver to view statement..." />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.user.name} ({d.driverCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" size="sm" className="h-9 text-xs">View Driver Statement</Button>
              </form>
            </CardContent>
          </Card>

          {driverId && selectedDriver && (
            <>
              {/* Driver Balance Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border p-4 bg-card text-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-emerald-600">₹{driverTotalCredit.toLocaleString("en-IN")}</p>
                  <p className="text-[11px] text-muted-foreground">Driver Trip Earnings</p>
                </div>
                <div className="rounded-xl border p-4 bg-card text-center">
                  <TrendingDown className="h-5 w-5 text-red-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-red-600">₹{driverTotalDebit.toLocaleString("en-IN")}</p>
                  <p className="text-[11px] text-muted-foreground">Advances & Payouts Disbursed</p>
                </div>
                <div className="rounded-xl border-2 border-primary/30 p-4 bg-primary/5 text-center">
                  <BookOpen className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className={`text-lg font-bold ${driverCurrentBalance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    ₹{Math.abs(driverCurrentBalance).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Driver Net Ledger Balance</p>
                </div>
              </div>

              {/* Driver Transactions Table */}
              <Card>
                <CardContent className="p-0">
                  {driverData.entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                      <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                      <p className="text-sm font-medium">No ledger entries for this driver yet</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-xs">Description</TableHead>
                          <TableHead className="text-xs">Type</TableHead>
                          <TableHead className="text-xs text-right">Earning Credit (+)</TableHead>
                          <TableHead className="text-xs text-right">Advance/Payout (-)</TableHead>
                          <TableHead className="text-xs text-right">Running Balance</TableHead>
                          <TableHead className="text-xs">Reference</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {driverData.entries.map((entry: any) => (
                          <TableRow key={entry.id}>
                            <TableCell className="text-xs">
                              {new Date(entry.createdAt).toLocaleDateString("en-IN")}
                            </TableCell>
                            <TableCell className="text-xs">{entry.description}</TableCell>
                            <TableCell>
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                entry.transactionType === "CREDIT"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                              }`}>
                                {entry.transactionType}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-right text-emerald-600 font-semibold">
                              {entry.transactionType === "CREDIT" ? `+ ₹${Number(entry.amount).toLocaleString("en-IN")}` : "—"}
                            </TableCell>
                            <TableCell className="text-xs text-right text-red-600 font-semibold">
                              {entry.transactionType === "DEBIT" ? `- ₹${Number(entry.amount).toLocaleString("en-IN")}` : "—"}
                            </TableCell>
                            <TableCell className={`text-xs text-right font-bold ${Number(entry.balanceAfter) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                              ₹{Number(entry.balanceAfter).toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-muted-foreground">
                              {entry.referenceType ?? "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {!driverId && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border rounded-xl bg-card">
              <User className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">Select a driver from the dropdown above</p>
              <p className="text-xs text-muted-foreground">Each driver has a real double-entry statement tracking their per-order trip earnings and advances.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
