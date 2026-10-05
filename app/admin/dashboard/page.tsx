import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { getAdminDashboardMetrics } from "@/lib/db/admin-service";
import { isDatabaseLive } from "@/lib/db/service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Car, Users, Truck, Package, TrendingUp, TrendingDown,
  DollarSign, AlertCircle, CheckCircle2, Clock, Activity,
  BarChart3, ArrowUpRight, ArrowDownLeft, Fuel, Wrench, Receipt, ArrowRight, CreditCard, Wallet
} from "lucide-react";
import { DashboardFilters } from "@/components/admin/dashboard-filters";
import { QuickActions } from "@/components/admin/quick-actions";

interface SearchParams {
  period?: string;
  month?: string;
  from?: string;
  to?: string;
}

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  trend,
  color = "default",
  badge,
  href,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  color?: "default" | "green" | "blue" | "amber" | "red" | "purple";
  badge?: string;
  href?: string;
}) {
  const colorMap: Record<string, string> = {
    default: "text-foreground bg-muted/40",
    green: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40",
    blue: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40",
    amber: "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40",
    red: "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40",
    purple: "text-purple-700 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/40",
  };

  const card = (
    <Card className={`relative overflow-hidden transition-all duration-200 h-full w-full flex flex-col justify-between ${
      href
        ? "cursor-pointer hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5 group"
        : "hover:shadow-md"
    }`}>
      <CardContent className="p-4 flex flex-col justify-between h-full flex-1">
        {/* Top: Title & Icon */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors truncate" title={title}>
                {title}
              </p>
              {href && (
                <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              )}
            </div>
          </div>
          <div className={`p-2 rounded-xl shrink-0 ${colorMap[color]} group-hover:scale-110 transition-transform`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        {/* Center: Metric Value */}
        <div className="my-2">
          <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground truncate">{value}</p>
        </div>

        {/* Bottom: Subtitle / Badge / Trend (Strictly identical height across all cards) */}
        <div className="h-5 flex items-center gap-1.5 overflow-hidden">
          {trend ? (
            <>
              <span className={`flex items-center gap-0.5 text-xs font-semibold shrink-0 ${trend.value >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {trend.value >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground truncate">{trend.label}</span>
            </>
          ) : (
            <div className="flex items-center gap-1.5 overflow-hidden w-full">
              {badge && <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5 font-medium shrink-0">{badge}</Badge>}
              {sub && <p className="text-xs text-muted-foreground truncate leading-none">{sub}</p>}
              {!badge && !sub && <span className="text-xs text-transparent select-none leading-none">—</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href} className="block no-underline h-full w-full">{card}</Link>;
  }

  return card;
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAuth(["SUPER_ADMIN"]);
  const params = await searchParams;
  const dbLive = await isDatabaseLive();

  let dateFrom: Date | undefined;
  let dateTo: Date | undefined;
  let periodLabel = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (params.month) {
    const [yearStr, monthStr] = params.month.split("-");
    const year = parseInt(yearStr, 10);
    const monthIdx = parseInt(monthStr, 10) - 1;

    const maxMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const requestedMonth = new Date(year, monthIdx, 1);

    if (requestedMonth <= maxMonth) {
      dateFrom = requestedMonth;
      dateTo = new Date(year, monthIdx + 1, 1);
      periodLabel = requestedMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    }
  } else if (params.period === "yesterday") {
    dateFrom = new Date(today);
    dateFrom.setDate(dateFrom.getDate() - 1);
    dateTo = new Date(today);
    periodLabel = "Yesterday";
  } else if (params.period === "week") {
    dateFrom = new Date(today);
    dateFrom.setDate(dateFrom.getDate() - dateFrom.getDay());
    dateTo = new Date(today);
    dateTo.setDate(dateTo.getDate() + 1);
    periodLabel = "This Week";
  } else if (params.period === "lastmonth") {
    dateFrom = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    dateTo = new Date(today.getFullYear(), today.getMonth(), 1);
    periodLabel = dateFrom.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  } else if (params.period === "month") {
    dateFrom = new Date(today.getFullYear(), today.getMonth(), 1);
    dateTo = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    periodLabel = dateFrom.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  } else {
    dateFrom = new Date(today);
    dateTo = new Date(today);
    dateTo.setDate(dateTo.getDate() + 1);
    periodLabel = "Today";
  }

  let metrics: Awaited<ReturnType<typeof getAdminDashboardMetrics>> | null = null;

  if (dbLive) {
    try {
      metrics = await getAdminDashboardMetrics(dateFrom, dateTo);
    } catch {
      metrics = null;
    }
  }

  // Fallback demo numbers when DB is offline
  const m = metrics ?? {
    vehicles: { total: 10, active: 10, available: 5 },
    drivers: { total: 8, active: 8 },
    trips: { today: 5, running: 4, completedToday: 1, thisWeek: 10, thisMonth: 10 },
    orders: { total: 15, delivered: 8, pending: 6, weekTotal: 15, monthTotal: 15, deliveryRate: 53 },
    financial: {
      todayPayments: 1630,
      todayExpenses: 4500,
      outstandingAdvances: 8500,
      totalCredit: 179920,
      totalDebit: 101507.5,
      netBalance: 78412.5,
      breakdown: {
        maintenance: 72150,
        fuel: 14717.5,
        driverPayments: 1630,
        driverAdvances: 8500,
        operational: 4500,
      },
      creditBreakdown: {
        clientInward: 111500,
        dpdAdvances: 52000,
        freightRevenue: 3320,
        codDelivered: 13100,
      },
    },
    weekPerformance: { completed: 5, totalOrders: 338, delivered: 255 },
    monthPerformance: { completed: 5, totalOrders: 338, delivered: 255 },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Owner Command Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Full fleet & operations overview · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={dbLive ? "default" : "secondary"} className={`text-xs ${dbLive ? "bg-emerald-600" : ""}`}>
            {dbLive ? "● Live DB" : "○ Demo Mode"}
          </Badge>
          <QuickActions />
        </div>
      </div>

      <DashboardFilters />

      {/* KPI Row 1 — Master Financial Overview (Total Credit & Total Debit Auto-Sum) */}
      <div className="space-y-3">
        <SectionHeader
          title="Financial Overview & Automated Ledger"
        />

        {/* Top Master Financial Cards: Total Credit, Total Debit, Net Profit */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <KpiCard
            href="/admin/ledger"
            title="Total Credit (All Revenue)"
            value={`₹${(m.financial.totalCredit ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            icon={ArrowDownLeft}
            color="green"
            badge="Total Inflow"
            sub="Client Invoices, DPD Advances & Deliveries"
          />

          <KpiCard
            href="/admin/expenses"
            title="Total Debit (Auto-Summed)"
            value={`₹${(m.financial.totalDebit ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            icon={ArrowUpRight}
            color="red"
            badge="Total Outflow"
            sub="Maintenance + Fuel/CNG + Driver Payouts + Advances"
          />

          <KpiCard
            href="/admin/ledger"
            title="Net Operating Balance / Profit"
            value={`₹${Math.abs(m.financial.netBalance ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            icon={DollarSign}
            color={(m.financial.netBalance ?? 0) >= 0 ? "green" : "red"}
            badge={(m.financial.netBalance ?? 0) >= 0 ? "Surplus (+)" : "Deficit (-)"}
            sub={(m.financial.netBalance ?? 0) >= 0 ? "Operating Profit (Credit > Debit)" : "Operating Loss (Debit > Credit)"}
          />
        </div>
      </div>

      {/* KPI Row 2 — Fleet */}
      <div>
        <SectionHeader title="Fleet Status" sub="Real-time vehicle & driver availability" />
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard href="/admin/vehicles" title="Total Vehicles" value={m.vehicles.total} icon={Car} color="blue" badge="Fleet" />
          <KpiCard href="/admin/vehicles?status=ON_TRIP" title="Active Vehicles" value={m.vehicles.active} icon={Car} color="green" sub={`${m.vehicles.total - m.vehicles.active} inactive`} />
          <KpiCard href="/admin/vehicles?status=AVAILABLE" title="Available Now" value={m.vehicles.available} icon={Car} color="green" badge="Ready" />
          <KpiCard href="/admin/drivers" title="Total Drivers" value={m.drivers.total} icon={Users} color="purple" />
          <KpiCard href="/admin/drivers?status=ACTIVE" title="Active Drivers" value={m.drivers.active} icon={Users} color="green" sub={`${m.drivers.total - m.drivers.active} offline`} />
          <KpiCard href="/admin/trips?status=RUNNING" title="Running Trips" value={m.trips.running} icon={Activity} color="amber" badge="Live" />
        </div>
      </div>

      {/* KPI Row 3 — Today's Operations */}
      <div>
        <SectionHeader title="Today's Operations" sub="Trips and deliveries for today" />
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard href="/admin/trips" title="Today's Trips" value={m.trips.today} icon={Truck} color="blue" />
          <KpiCard href="/admin/trips?status=COMPLETED" title="Completed" value={m.trips.completedToday} icon={CheckCircle2} color="green" />
          <KpiCard href="/admin/orders" title="Total Orders" value={m.orders.total.toLocaleString()} icon={Package} color="blue" />
          <KpiCard href="/admin/orders?status=DELIVERED" title="Delivered" value={m.orders.delivered.toLocaleString()} icon={CheckCircle2} color="green" sub={`${m.orders.deliveryRate}% rate`} />
          <KpiCard href="/admin/orders?status=PENDING" title="Pending" value={m.orders.pending} icon={Clock} color="amber" />
          <KpiCard href="/admin/advances" title="Outstanding Adv." value={`₹${(m.financial.outstandingAdvances / 1000).toFixed(1)}k`} icon={AlertCircle} color="red" />
        </div>
      </div>

      <Separator />

      {/* Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Delivery Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Delivery Performance</CardTitle>
            <CardDescription className="text-xs">All time order delivery breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{m.orders.deliveryRate}%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Overall delivery rate</p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-xs text-muted-foreground">Total: <span className="font-semibold text-foreground">{m.orders.total.toLocaleString()}</span></p>
                <p className="text-xs text-muted-foreground">Delivered: <span className="font-semibold text-emerald-600">{m.orders.delivered.toLocaleString()}</span></p>
                <p className="text-xs text-muted-foreground">Pending: <span className="font-semibold text-amber-600">{m.orders.pending}</span></p>
              </div>
            </div>
            <Progress value={m.orders.deliveryRate} className="h-2" />
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-lg bg-muted/40 p-3 text-center">
                <p className="text-lg font-bold text-emerald-600">{m.orders.weekTotal}</p>
                <p className="text-[11px] text-muted-foreground">This Week</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3 text-center">
                <p className="text-lg font-bold text-blue-600">{m.orders.monthTotal}</p>
                <p className="text-[11px] text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trip Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Trip Performance</CardTitle>
            <CardDescription className="text-xs">Trips across different periods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { label: "Today", trips: m.trips.today, orders: 0, completed: m.trips.completedToday },
                { label: "This Week", trips: m.trips.thisWeek, orders: m.weekPerformance.totalOrders, completed: m.weekPerformance.completed },
                { label: "This Month", trips: m.trips.thisMonth, orders: m.monthPerformance.totalOrders, completed: m.monthPerformance.completed },
              ].map(p => (
                <div key={p.label} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-xs font-medium text-muted-foreground w-20">{p.label}</span>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <p className="font-bold">{p.trips}</p>
                      <p className="text-muted-foreground text-[10px]">Trips</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-emerald-600">{p.completed}</p>
                      <p className="text-muted-foreground text-[10px]">Done</p>
                    </div>
                    {p.orders > 0 && (
                      <div className="text-center">
                        <p className="font-bold text-blue-600">{p.orders}</p>
                        <p className="text-muted-foreground text-[10px]">Orders</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fleet Utilization */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Fleet Utilization</CardTitle>
            <CardDescription className="text-xs">Current vehicle & driver usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Vehicles Active</span>
                  <span className="font-semibold">{m.vehicles.active}/{m.vehicles.total}</span>
                </div>
                <Progress value={(m.vehicles.active / Math.max(m.vehicles.total, 1)) * 100} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Drivers On Duty</span>
                  <span className="font-semibold">{m.drivers.active}/{m.drivers.total}</span>
                </div>
                <Progress value={(m.drivers.active / Math.max(m.drivers.total, 1)) * 100} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Delivery Rate</span>
                  <span className="font-semibold">{m.orders.deliveryRate}%</span>
                </div>
                <Progress value={m.orders.deliveryRate} className="h-1.5" />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-muted/40 p-3 text-center">
                <p className="text-lg font-bold">{m.trips.running}</p>
                <p className="text-[11px] text-muted-foreground">Live Trips</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3 text-center">
                <p className="text-lg font-bold text-emerald-600">{m.vehicles.available}</p>
                <p className="text-[11px] text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <SectionHeader title="Quick Access" sub="Navigate to management modules" />
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            { label: "Vehicles", href: "/admin/vehicles", icon: Car, color: "text-blue-600" },
            { label: "Drivers", href: "/admin/drivers", icon: Users, color: "text-purple-600" },
            { label: "Trips", href: "/admin/trips", icon: Truck, color: "text-indigo-600" },
            { label: "Orders", href: "/admin/orders", icon: Package, color: "text-orange-600" },
            { label: "Payments", href: "/admin/payments/driver", icon: DollarSign, color: "text-green-600" },
            { label: "Reports", href: "/admin/reports", icon: BarChart3, color: "text-cyan-600" },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-card hover:bg-muted/60 hover:shadow-sm transition-all group"
            >
              <item.icon className={`h-6 w-6 ${item.color} group-hover:scale-110 transition-transform`} />
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
