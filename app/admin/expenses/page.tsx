import { requireAuth } from "@/lib/auth/session";
import { getMasterDebitExpenses, MasterDebitItem } from "@/lib/db/admin-service";
import { isDatabaseLive } from "@/lib/db/service";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Receipt, Wrench, Fuel, DollarSign, Users, Truck, UserCheck,
  ArrowUpRight, Search, CheckCircle2, ShieldAlert, Filter, X
} from "lucide-react";
import Link from "next/link";

interface SearchParams {
  category?: string;
  driverId?: string;
  search?: string;
  page?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  MAINTENANCE: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200",
  FUEL: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200",
  DRIVER_PAYMENT: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200",
  DRIVER_ADVANCE: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200",
  OPERATIONAL: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200",
  VEHICLE_EXPENSE: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-200",
  TRIP_TOLL: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-200",
  DRIVER_CLAIM: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200",
};

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAuth(["SUPER_ADMIN"]);
  const params = await searchParams;
  const dbLive = await isDatabaseLive();

  const page = parseInt(params.page ?? "1", 10);
  const category = params.category ?? "ALL";
  const driverId = params.driverId ?? "ALL";
  const search = params.search ?? "";

  // Fetch driver list for dropdown filter
  const drivers = dbLive
    ? await prisma.driver.findMany({
        include: { user: true },
        orderBy: { user: { name: "asc" } },
      })
    : [];

  let data = {
    items: [] as MasterDebitItem[],
    totals: {
      grandTotal: 123305.5,
      maintenanceTotal: 86750,
      fuelTotal: 14715.5,
      driverPaymentsTotal: 1630,
      driverAdvancesTotal: 7000,
      operationalTotal: 13210,
    },
    counts: {
      all: 0,
      maintenance: 0,
      fuel: 0,
      driverPayments: 0,
      driverAdvances: 0,
      operational: 0,
    },
    total: 0,
    page: 1,
    totalPages: 1,
  };

  if (dbLive) {
    try {
      data = await getMasterDebitExpenses({ category, driverId, search, page, limit: 50 });
    } catch {
      // fallback
    }
  }

  const selectedDriver = drivers.find(d => d.id === driverId);

  const categoryTabs = [
    { id: "ALL", label: "All Outflows", amount: data.totals.grandTotal, count: data.counts.all },
    { id: "MAINTENANCE", label: "Maintenance & Repairs", amount: data.totals.maintenanceTotal, count: data.counts.maintenance },
    { id: "FUEL", label: "Fuel & CNG Refills", amount: data.totals.fuelTotal, count: data.counts.fuel },
    { id: "DRIVER_ADVANCE", label: "Driver Advances", amount: data.totals.driverAdvancesTotal, count: data.counts.driverAdvances },
    { id: "DRIVER_PAYMENT", label: "Driver Payouts", amount: data.totals.driverPaymentsTotal, count: data.counts.driverPayments },
    { id: "OPERATIONAL", label: "Toll, Fastag & Ops", amount: data.totals.operationalTotal, count: data.counts.operational },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Operating Expenses & Debit Outflow</h1>
            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40">
              Total Debit Ledger
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Complete auto-sum breakdown with Driver Name, Vehicle No. and All Operating Debit Heads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm" className="text-xs">Back to Dashboard</Button>
          </Link>
          <Link href="/admin/maintenance">
            <Button size="sm" className="text-xs bg-red-600 hover:bg-red-700 text-white gap-1.5">
              <Wrench className="h-3.5 w-3.5" />
              Add Repair Log
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Master Outflow KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-xl border-2 border-red-200 bg-red-50/50 dark:bg-red-950/20 p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400">Total Debit (Auto-Sum)</p>
            <ArrowUpRight className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1.5">
            ₹{Math.round(data.totals.grandTotal).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">All 5 Expense Heads Combined</p>
        </div>

        <div className="rounded-xl border p-3.5 bg-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">Maintenance & Repairs</p>
            <Wrench className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-xl font-bold mt-1.5">
            ₹{Math.round(data.totals.maintenanceTotal).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{data.counts.maintenance} Garage Breakdowns</p>
        </div>

        <div className="rounded-xl border p-3.5 bg-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">Fuel & CNG Refills</p>
            <Fuel className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold mt-1.5">
            ₹{Math.round(data.totals.fuelTotal).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{data.counts.fuel} Tank Fill-ups</p>
        </div>

        <div className="rounded-xl border p-3.5 bg-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">Driver Advances & Payouts</p>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-xl font-bold mt-1.5">
            ₹{Math.round(data.totals.driverPaymentsTotal + data.totals.driverAdvancesTotal).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            ₹{Math.round(data.totals.driverAdvancesTotal).toLocaleString("en-IN")} Adv + ₹{Math.round(data.totals.driverPaymentsTotal).toLocaleString("en-IN")} Payouts
          </p>
        </div>

        <div className="rounded-xl border p-3.5 bg-card col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">Tolls, Fastag & Ops</p>
            <Truck className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold mt-1.5">
            ₹{Math.round(data.totals.operationalTotal).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Fastag, MCD Cess & Ops</p>
        </div>
      </div>

      {/* Main Expense Table Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="space-y-3">
            {/* Category Tabs */}
            <div className="flex gap-2 flex-wrap">
              {categoryTabs.map(tab => {
                const isActive = category === tab.id;
                return (
                  <Link
                    key={tab.id}
                    href={`/admin/expenses?category=${tab.id}${driverId !== "ALL" ? `&driverId=${driverId}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-foreground"}`}>
                      ₹{Math.round(tab.amount).toLocaleString("en-IN")}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Filter Toolbar (Driver Selector + Search Bar) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t">
              <form method="get" className="flex flex-wrap items-center gap-2 flex-1">
                <input type="hidden" name="category" value={category} />

                {/* Driver Filter Dropdown */}
                <div className="relative min-w-[200px]">
                  <select
                    name="driverId"
                    defaultValue={driverId}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                  >
                    <option value="ALL">👥 All Drivers & Fleet</option>
                    <option value="HQ">🏢 HQ Admin / Operations</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        👤 {d.user.name} ({d.driverCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Text Search Input */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    name="search"
                    placeholder="Search by driver name, vehicle no, parts, bunk..."
                    defaultValue={search}
                    className="pl-8 h-9 text-xs"
                  />
                </div>

                <Button type="submit" size="sm" variant="default" className="h-9 text-xs gap-1.5">
                  <Filter className="h-3.5 w-3.5" />
                  Apply Filters
                </Button>

                {(driverId !== "ALL" || search) && (
                  <Link href={`/admin/expenses?category=${category}`}>
                    <Button type="button" size="sm" variant="ghost" className="h-9 text-xs gap-1 text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                      Reset
                    </Button>
                  </Link>
                )}
              </form>

              {/* Active Filter Notification Pill */}
              {selectedDriver && (
                <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20 shrink-0">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Filtered for: <strong>{selectedDriver.user.name}</strong> ({selectedDriver.driverCode})</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {!dbLive ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Receipt className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">Database Offline</p>
            </div>
          ) : data.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Receipt className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">No expense items found matching the selected filter</p>
              <p className="text-xs text-muted-foreground">Try selecting &apos;All Outflows&apos; or changing your driver filter/search term.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-semibold">Date</TableHead>
                      <TableHead className="text-xs font-semibold">Category</TableHead>
                      <TableHead className="text-xs font-semibold">Expense Head & Details</TableHead>
                      <TableHead className="text-xs font-semibold">Driver Name</TableHead>
                      <TableHead className="text-xs font-semibold">Vehicle</TableHead>
                      <TableHead className="text-xs font-semibold">Payment Mode</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Debit Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map(item => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        {/* 1. Date */}
                        <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                          {new Date(item.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>

                        {/* 2. Category */}
                        <TableCell className="whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${CATEGORY_COLORS[item.category] || "bg-muted text-foreground"}`}>
                            {item.categoryLabel}
                          </span>
                        </TableCell>

                        {/* 3. Expense Details */}
                        <TableCell className="max-w-xs sm:max-w-sm">
                          <p className="text-sm font-semibold">{item.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {item.invoiceNumber && (
                              <span className="inline-block text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                Inv: {item.invoiceNumber}
                              </span>
                            )}
                            {item.referenceId && (
                              <span className="inline-block text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                Ref: {item.referenceId}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* 4. Driver Name */}
                        <TableCell className="whitespace-nowrap">
                          <div>
                            {item.driverId ? (
                              <Link
                                href={`/admin/drivers/${item.driverId}`}
                                className="text-xs font-semibold text-foreground hover:text-primary hover:underline transition-colors block"
                              >
                                {item.driverName}
                              </Link>
                            ) : (
                              <p className="text-xs font-semibold text-foreground">
                                {item.driverName}
                              </p>
                            )}
                            {item.driverCode ? (
                              <span className="inline-block text-[10px] font-mono text-muted-foreground bg-muted/60 px-1 py-0.2 rounded mt-0.5">
                                {item.driverCode}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">Central / HQ</span>
                            )}
                          </div>
                        </TableCell>

                        {/* 5. Vehicle */}
                        <TableCell className="whitespace-nowrap">
                          {item.vehicleNumber ? (
                            <div className="flex items-center gap-1.5">
                              <Truck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="font-mono text-xs font-semibold bg-muted/80 px-2 py-0.5 rounded border text-foreground">
                                {item.vehicleNumber}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">—</span>
                          )}
                        </TableCell>

                        {/* 6. Payment Mode */}
                        <TableCell className="text-xs whitespace-nowrap">
                          <span className="font-mono text-[11px] bg-secondary px-1.5 py-0.5 rounded">
                            {item.paymentMode}
                          </span>
                        </TableCell>

                        {/* 7. Status */}
                        <TableCell className="whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            {item.status}
                          </span>
                        </TableCell>

                        {/* 8. Debit Amount */}
                        <TableCell className="text-sm font-bold text-right text-red-600 whitespace-nowrap">
                          - ₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Table Summary Footer */}
              <div className="border-t px-4 py-3 bg-muted/20 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
                <span>Showing {data.items.length} of {data.total} recorded debit transactions</span>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">Filtered Outflow Subtotal:</span>
                  <span className="text-base font-bold text-red-600">
                    ₹{data.items.reduce((s, i) => s + i.amount, 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages}</p>
                  <div className="flex gap-2">
                    {data.page > 1 && (
                      <Link href={`/admin/expenses?page=${data.page - 1}&category=${category}${driverId !== "ALL" ? `&driverId=${driverId}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs">Previous</Button>
                      </Link>
                    )}
                    {data.page < data.totalPages && (
                      <Link href={`/admin/expenses?page=${data.page + 1}&category=${category}${driverId !== "ALL" ? `&driverId=${driverId}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs">Next</Button>
                      </Link>
                    )}
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
