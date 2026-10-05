import { requireAuth } from "@/lib/auth/session";
import { getDriverDetailedProfile } from "@/lib/db/admin-service";
import { isDatabaseLive } from "@/lib/db/service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Truck, Car, Calendar, DollarSign, Package, CheckCircle2, Clock,
  ArrowLeft, ArrowRight, ArrowUpRight, MapPin, Navigation, ShieldCheck,
  CreditCard, Phone, Mail, AlertTriangle, FileText, UserCheck, AlertCircle, Wallet
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    tab?: string;
    tripPage?: string;
    tripStatus?: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200",
  ON_TRIP: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200",
  INACTIVE: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200",
  SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200",
};

const TRIP_STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200",
  RUNNING: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 animate-pulse",
  STARTED: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200",
  ASSIGNED: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200",
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200",
};

export default async function DriverDetailPage({ params, searchParams }: PageProps) {
  await requireAuth(["SUPER_ADMIN"]);
  const { id } = await params;
  const sParams = await searchParams;
  const dbLive = await isDatabaseLive();

  const activeTab = sParams.tab ?? "trips";
  const tripPage = parseInt(sParams.tripPage ?? "1", 10);
  const tripStatus = sParams.tripStatus ?? "ALL";

  if (!dbLive) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Database is offline. Connect MySQL to view live driver profiles.</p>
      </div>
    );
  }

  const profile = await getDriverDetailedProfile({
    driverId: id,
    tripPage,
    tripLimit: 8,
    tripStatus,
  });

  if (!profile) {
    notFound();
  }

  const { driver, stats, advances, payments, trips } = profile;
  const currentMonthName = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const isLicExpiring = driver.licenseExpiry
    ? new Date(driver.licenseExpiry).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Driver Header Banner */}
      <div className="flex flex-col gap-4">
        <div>
          <Link
            href="/admin/drivers"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Driver Management
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                {driver.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold tracking-tight text-foreground">{driver.user.name}</h1>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted border text-foreground">
                    {driver.driverCode}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_COLORS[driver.status] || "bg-muted"}`}>
                    {driver.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-muted-foreground/70" />
                    {driver.user.phone ?? "No phone"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-muted-foreground/70" />
                    {driver.user.email}
                  </span>
                  <span>•</span>
                  <span>License: <strong className="font-mono text-foreground">{driver.licenseNumber}</strong></span>
                  <span>•</span>
                  <span>Rate: <strong className="text-foreground">₹{Number(driver.perOrderRate)}/order</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/admin/advances?search=${encodeURIComponent(driver.driverCode)}`}>
                <Button size="sm" variant="outline" className="text-xs gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                  Advances List
                </Button>
              </Link>
              <Link href={`/admin/ledger?driverId=${driver.id}`}>
                <Button size="sm" variant="outline" className="text-xs gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  Driver Ledger
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Equal KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5 items-stretch">
        {/* 1. This Month Payment Generated */}
        <Card className="h-full w-full flex flex-col justify-between border-2 border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
          <CardContent className="p-4 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 truncate">
                Month Payment
              </p>
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shrink-0">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-emerald-700 dark:text-emerald-300">
                ₹{stats.monthTripsEarnings.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="h-5 flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
              <span className="truncate">
                {stats.monthTrips} Trips × ₹{stats.latestTripRate}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Net Pay (Month Payment - Total Advance Given) */}
        {(() => {
          const advancePayment = stats.totalAdvanceGiven;
          const netPay = stats.monthTripsEarnings - advancePayment;
          const isNegative = netPay < 0;

          return (
            <Card className={`h-full w-full flex flex-col justify-between border-2 shadow-xs ${
              isNegative
                ? "border-rose-400/60 bg-rose-50/40 dark:bg-rose-950/20"
                : "border-primary/40 bg-primary/10 dark:bg-primary/20"
            }`}>
              <CardContent className="p-4 flex flex-col justify-between h-full flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-[11px] font-semibold uppercase tracking-wider truncate ${
                    isNegative ? "text-rose-700 dark:text-rose-400" : "text-primary"
                  }`}>
                    Net Pay
                  </p>
                  <div className={`p-2 rounded-xl shrink-0 ${
                    isNegative
                      ? "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
                      : "bg-primary/20 text-primary"
                  }`}>
                    <Wallet className="h-4 w-4" />
                  </div>
                </div>
                <div className="my-2">
                  <p className={`text-2xl font-bold tabular-nums tracking-tight ${
                    isNegative ? "text-rose-700 dark:text-rose-400" : "text-primary"
                  }`}>
                    {isNegative ? `-₹${Math.abs(netPay).toLocaleString("en-IN")}` : `₹${netPay.toLocaleString("en-IN")}`}
                  </p>
                </div>
                <div className="h-5 flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
                  <span className="truncate">
                    ₹{stats.monthTripsEarnings} - ₹{advancePayment.toLocaleString("en-IN")}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* 3. Advance Payment (Total Advance Given) */}
        <Card className="h-full w-full flex flex-col justify-between border-2 border-amber-200/70 bg-amber-50/30 dark:bg-amber-950/10">
          <CardContent className="p-4 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 truncate">
                Advance Payment
              </p>
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 shrink-0">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-amber-700 dark:text-amber-300">
                ₹{stats.totalAdvanceGiven.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="h-5 flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
              <span className="truncate">Total advance given</span>
            </div>
          </CardContent>
        </Card>

        {/* 4. This Month's Trips */}
        <Card className="h-full w-full flex flex-col justify-between border-2 border-blue-200/60 bg-blue-50/20 dark:bg-blue-950/10">
          <CardContent className="p-4 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 truncate">
                Month Trips
              </p>
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                {stats.monthTrips} <span className="text-xs font-normal text-muted-foreground">trips</span>
              </p>
            </div>
            <div className="h-5 flex items-center gap-1.5 overflow-hidden">
              <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5 font-medium truncate">
                {currentMonthName}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 5. Total Trips (Lifetime) */}
        <Card className="h-full w-full flex flex-col justify-between">
          <CardContent className="p-4 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                Total Trips
              </p>
              <div className="p-2 rounded-xl bg-muted text-muted-foreground shrink-0">
                <Truck className="h-4 w-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                {stats.totalTrips} <span className="text-xs font-normal text-muted-foreground">all-time</span>
              </p>
            </div>
            <div className="h-5 flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
              <span className="truncate">{stats.completedTrips} done · {stats.runningTrips} active</span>
            </div>
          </CardContent>
        </Card>

        {/* 6. Assigned Vehicle / Fleet Unit */}
        <Card className="h-full w-full flex flex-col justify-between">
          <CardContent className="p-4 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                Vehicle
              </p>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shrink-0">
                <Car className="h-4 w-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-lg font-bold tabular-nums font-mono tracking-tight text-foreground truncate">
                {stats.currentVehicle?.vehicleNumber ?? "Unassigned"}
              </p>
            </div>
            <div className="h-5 flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
              <span className="truncate">{stats.currentVehicle?.make} {stats.currentVehicle?.model || "Fleet"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs (Trips History, Advances Given, KYC & Compliance) */}
      <div className="flex items-center gap-2 border-b">
        <Link
          href={`/admin/drivers/${driver.id}?tab=trips`}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 px-1 ${
            activeTab === "trips"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Truck className="h-4 w-4" />
          Trips & Route History ({stats.totalTrips})
        </Link>

        <Link
          href={`/admin/drivers/${driver.id}?tab=advances`}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 px-3 ${
            activeTab === "advances"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Advances Given ({advances.length})
        </Link>

        <Link
          href={`/admin/drivers/${driver.id}?tab=profile`}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 px-3 ${
            activeTab === "profile"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          KYC, License & Address
        </Link>
      </div>

      {/* TAB 1: TRIPS & ROUTE HISTORY WITH PAGINATION */}
      {activeTab === "trips" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold">Past Trips & Route History</CardTitle>
                <CardDescription className="text-xs">
                  Detailed route, vehicle number, orders count, and trip status for {driver.user.name}
                </CardDescription>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg border text-xs">
                {["ALL", "RUNNING", "COMPLETED"].map((st) => (
                  <Link
                    key={st}
                    href={`/admin/drivers/${driver.id}?tab=trips&tripStatus=${st}`}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      tripStatus === st
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st === "ALL" ? "All Trips" : st === "RUNNING" ? "Active Now" : "Completed"}
                  </Link>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {trips.items.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Truck className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium">No trips recorded for this filter</p>
                <p className="text-xs">Trips assigned to {driver.user.name} will appear here.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="text-xs font-semibold">Trip ID & Date</TableHead>
                        <TableHead className="text-xs font-semibold">Route (Kaha se Kaha tak)</TableHead>
                        <TableHead className="text-xs font-semibold">Gadi Number (Vehicle)</TableHead>
                        <TableHead className="text-xs font-semibold">Orders Progress</TableHead>
                        <TableHead className="text-xs font-semibold">Distance (Odo)</TableHead>
                        <TableHead className="text-xs font-semibold">Trip Price (Rate)</TableHead>
                        <TableHead className="text-xs font-semibold">Trip Advance</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trips.items.map((t) => {
                        const origin = "Delhi Central Fleet Hub";
                        const destination = `${t.dpd.name}, ${t.dpd.city}`;
                        const distance = t.startKm && t.endKm ? t.endKm - t.startKm : null;
                        const orderPercent = t.totalOrders > 0 ? Math.round((t.deliveredOrders / t.totalOrders) * 100) : 0;
                        const tripRate = Number(t.perOrderRate || 35);

                        return (
                          <TableRow key={t.id} className="hover:bg-muted/30">
                            {/* Trip Number & Date */}
                            <TableCell className="whitespace-nowrap">
                              <p className="text-xs font-bold font-mono text-primary">{t.tripNumber}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {new Date(t.tripDate).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </TableCell>

                            {/* Route: Origin to Destination Hub */}
                            <TableCell className="min-w-[240px]">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                  <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                  <span className="truncate">{origin}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                  <Navigation className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                  <span className="truncate">{destination}</span>
                                </div>
                              </div>
                            </TableCell>

                            {/* Gadi Number / Vehicle */}
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Truck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="font-mono text-xs font-bold bg-muted/80 px-2 py-0.5 rounded border text-foreground">
                                  {t.vehicle.vehicleNumber}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {t.vehicle.make} {t.vehicle.model || t.vehicle.vehicleType}
                              </p>
                            </TableCell>

                            {/* Orders Progress */}
                            <TableCell className="min-w-[140px]">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-foreground">{t.deliveredOrders} / {t.totalOrders}</span>
                                  <span className="text-[10px] text-muted-foreground">{orderPercent}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${orderPercent === 100 ? "bg-emerald-500" : "bg-primary"}`}
                                    style={{ width: `${orderPercent}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>

                            {/* Distance */}
                            <TableCell className="whitespace-nowrap text-xs">
                              {distance ? (
                                <span className="font-semibold text-foreground">{distance} km</span>
                              ) : (
                                <span className="text-muted-foreground">{t.startKm ? `${t.startKm} km (Odo)` : "—"}</span>
                              )}
                            </TableCell>

                            {/* Trip Price (Rate: ₹25 or ₹35) */}
                            <TableCell className="whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border font-mono ${
                                  tripRate === 25
                                    ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300"
                                    : "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300"
                                }`}
                              >
                                {tripRate === 25 ? "⚡" : "⭐"} ₹{tripRate} / trip
                              </span>
                            </TableCell>

                            {/* Trip Advance Given */}
                            <TableCell className="whitespace-nowrap text-xs font-mono font-medium">
                              {Number(t.driverAdvance) > 0 ? (
                                <span className="text-amber-700 dark:text-amber-400">
                                  ₹{Number(t.driverAdvance).toLocaleString("en-IN")}
                                </span>
                              ) : (
                                <span className="text-muted-foreground italic">—</span>
                              )}
                            </TableCell>

                            {/* Status */}
                            <TableCell className="whitespace-nowrap text-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${TRIP_STATUS_COLORS[t.status] || "bg-muted"}`}>
                                {t.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                <div className="border-t px-4 py-3 bg-muted/20 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <span className="text-muted-foreground">
                    Showing {trips.items.length} of {trips.total} trips for this driver
                  </span>

                  {trips.totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground mr-1">
                        Page {trips.page} of {trips.totalPages}
                      </span>
                      {trips.page > 1 && (
                        <Link href={`/admin/drivers/${driver.id}?tab=trips&tripStatus=${tripStatus}&tripPage=${trips.page - 1}`}>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            Previous
                          </Button>
                        </Link>
                      )}
                      {trips.page < trips.totalPages && (
                        <Link href={`/admin/drivers/${driver.id}?tab=trips&tripStatus=${tripStatus}&tripPage=${trips.page + 1}`}>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            Next
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: ADVANCES GIVEN BY OWNER */}
      {activeTab === "advances" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Driver Advance History</CardTitle>
                <CardDescription className="text-xs">
                  Complete record of advances given by the fleet owner to {driver.user.name}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total Advances Disbursed</p>
                <p className="text-lg font-bold text-amber-600">₹{stats.totalAdvanceGiven.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {advances.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <DollarSign className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium">No advance records found for this driver</p>
                <p className="text-xs">When owner issues transit or cash advance, it will be listed here.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-semibold">Date Given</TableHead>
                    <TableHead className="text-xs font-semibold">Purpose & Notes</TableHead>
                    <TableHead className="text-xs font-semibold">Trip Ref</TableHead>
                    <TableHead className="text-xs font-semibold">Payment Mode</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Advance Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advances.map((adv) => (
                    <TableRow key={adv.id}>
                      <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                        {new Date(adv.approvedDate || adv.requestDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-xs">
                        <p className="font-medium text-foreground">{adv.notes || "Trip Route Advance"}</p>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {adv.trip?.tripNumber || "General Transit"}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        <span className="bg-secondary px-1.5 py-0.5 rounded text-[11px]">
                          {adv.paymentMode}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {adv.status === "RECOVERED" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
                            SETTLED
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                            GIVEN
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-bold text-right text-amber-600 whitespace-nowrap">
                        ₹{Number(adv.amount).toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: KYC, LICENSE & ADDRESS */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                License & Identity Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Driving License Number</span>
                <span className="font-mono font-bold text-foreground">{driver.licenseNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b items-center">
                <span className="text-muted-foreground">License Expiry Date</span>
                <span className={`font-medium ${isLicExpiring ? "text-red-600 font-bold flex items-center gap-1" : "text-foreground"}`}>
                  {isLicExpiring && <AlertTriangle className="h-3 w-3" />}
                  {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString("en-IN") : "Not specified"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Aadhar Number</span>
                <span className="font-mono font-medium text-foreground">{driver.aadharNumber || "—"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">PAN Number</span>
                <span className="font-mono font-medium text-foreground">{driver.panNumber || "—"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Joining Date</span>
                <span className="text-foreground">{new Date(driver.dateOfJoining).toLocaleDateString("en-IN")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Contact & Address Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Primary Mobile</span>
                <span className="font-semibold text-foreground">{driver.user.phone || "—"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Emergency Contact</span>
                <span className="font-semibold text-foreground">{driver.emergencyContact || "—"}</span>
              </div>
              <div className="py-1.5 border-b">
                <span className="text-muted-foreground block mb-0.5">Current Address</span>
                <p className="text-foreground font-medium">{driver.currentAddress || "Not documented"}</p>
              </div>
              <div className="py-1.5">
                <span className="text-muted-foreground block mb-0.5">Permanent Address</span>
                <p className="text-foreground font-medium">{driver.permanentAddress || "Same as current address"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
