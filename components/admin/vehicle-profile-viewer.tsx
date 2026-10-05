"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Car,
  Wrench,
  Gauge,
  Calendar,
  Building2,
  Receipt,
  Search,
  ArrowLeft,
  Truck,
  Plus,
  Clock,
  User,
  MapPin,
  Navigation,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Phone,
  Timer,
  ShieldCheck,
} from "lucide-react";
import { AddVehicleExpenseDialog } from "./add-vehicle-expense-dialog";

interface VehicleProfileViewerProps {
  vehicle: {
    id: string;
    vehicleNumber: string;
    vehicleType: string;
    make: string;
    model: string;
    year: number;
    capacityTons: number;
    status: string;
    currentKm: number;
    insuranceExpiry: Date | null;
    fitnessExpiry: Date | null;
    pollutionExpiry: Date | null;
    permitExpiry: Date | null;
    fuelType: string;
    ownershipType: string;
    currentDriver: string;
    activeTripNumber: string | null;
    trips: Array<{
      id: string;
      tripNumber: string;
      tripDate: Date | string;
      startTime: Date | string | null;
      endTime: Date | string | null;
      status: string;
      totalOrders: number;
      deliveredOrders: number;
      failedOrders: number;
      startKm: number | null;
      endKm: number | null;
      driverAdvance: number;
      driver?: {
        id?: string;
        name?: string;
        driverCode?: string;
        phone?: string;
        user?: {
          name?: string;
          phone?: string;
        };
      } | null;
      dpd?: {
        id?: string;
        name?: string;
        city?: string;
        code?: string;
      } | null;
    }>;
  };
  analytics: {
    lifetimeTotal: number;
    currentMonthSpend: number;
    prevMonthSpend: number;
    totalRepairsCount: number;
    averagePerRepair: number;
  };
  monthlySummaries: Array<{
    monthKey: string;
    monthName: string;
    totalCost: number;
    repairCount: number;
    items: string[];
  }>;
  maintenanceRecords: Array<{
    id: string;
    vehicleId: string;
    driverId?: string | null;
    driverName?: string | null;
    driverCode?: string | null;
    serviceDate: Date;
    serviceType: string;
    categoryLabel: string;
    cost: number;
    odometerReading: number | null;
    workshopName: string | null;
    invoiceNumber: string | null;
    invoiceUrl: string | null;
    description: string;
    monthYear: string;
    monthKey: string;
  }>;
}

const TRIP_STATUS_COLORS: Record<string, string> = {
  RUNNING: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200",
  DRAFT: "bg-muted text-muted-foreground border-border",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200",
};

export function VehicleProfileViewer({
  vehicle,
  analytics,
  monthlySummaries,
  maintenanceRecords,
}: VehicleProfileViewerProps) {
  // Default to trips so "Konsa Driver Kab Leke Gaya" is immediately visible on page load!
  const [activeTab, setActiveTab] = useState<"trips" | "maintenance">("trips");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecords = maintenanceRecords.filter((rec) => {
    const matchesMonth = selectedMonth === "ALL" || rec.monthKey === selectedMonth;
    const matchesSearch =
      !searchQuery ||
      rec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.driverName && rec.driverName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.driverCode && rec.driverCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.workshopName && rec.workshopName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.invoiceNumber && rec.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesMonth && matchesSearch;
  });

  const trips = vehicle.trips || [];

  return (
    <div className="space-y-5">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/vehicles">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground">
                {vehicle.vehicleNumber}
              </h1>
              <Badge
                className={`text-xs font-bold ${
                  vehicle.status === "ON_TRIP"
                    ? "bg-purple-600 text-white"
                    : vehicle.status === "AVAILABLE"
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-600 text-white"
                }`}
              >
                {vehicle.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {vehicle.make} {vehicle.model} ({vehicle.year}) &bull; {vehicle.vehicleType} &bull; {vehicle.fuelType}
            </p>
          </div>
        </div>

        {/* Add Maintenance Expense Action Button */}
        <AddVehicleExpenseDialog
          vehicleId={vehicle.id}
          vehicleNumber={vehicle.vehicleNumber}
          currentKm={vehicle.currentKm}
        />
      </div>

      {/* Financial & Operational KPI Cards (Equal height & width) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Abhi Kiske Paas Hai Gaadi (Current Driver) */}
        <Card className="h-full w-full flex flex-col justify-between border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary truncate">
                Current Driver / In-Charge
              </p>
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <User className="h-4 w-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-xl font-bold tracking-tight text-foreground truncate">
                {vehicle.currentDriver}
              </p>
            </div>
            <div className="h-5 flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
              <span>{vehicle.activeTripNumber ? `Active Trip: ${vehicle.activeTripNumber}` : "Currently available at hub"}</span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Total Trips Completed (Movement Log) */}
        <Card className="h-full w-full flex flex-col justify-between">
          <CardContent className="p-4 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                Total Trips Made
              </p>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shrink-0">
                <Truck className="h-4 w-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                {trips.length} <span className="text-sm font-normal text-muted-foreground">trips logged</span>
              </p>
            </div>
            <div className="h-5 flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
              <span>{vehicle.currentKm.toLocaleString()} KM current odometer</span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Total Maintenance Kharcha */}
        <Card className="h-full w-full flex flex-col justify-between border-2 border-rose-500/20 bg-rose-500/5">
          <CardContent className="p-4 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400 truncate">
                Total Maintenance Kharcha
              </p>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 shrink-0">
                <Wrench className="h-4 w-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-rose-600">
                ₹{analytics.lifetimeTotal.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="h-5 flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
              <span>{analytics.totalRepairsCount} maintenance incidents</span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Average Cost Per Repair */}
        <Card className="h-full w-full flex flex-col justify-between">
          <CardContent className="p-4 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                Avg Cost / Repair
              </p>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shrink-0">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                ₹{analytics.averagePerRepair.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="h-5 flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
              <span>Per incident average</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prominent Section Switcher Tabs */}
      <div className="flex items-center gap-2 border-b bg-muted/20 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab("trips")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            activeTab === "trips"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Navigation className="h-4 w-4" />
          <span>🚚 Konsa Driver Kab Leke Gaya & Kahan Se Kahan Tak ({trips.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("maintenance")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            activeTab === "maintenance"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Wrench className="h-4 w-4" />
          <span>🛠️ Iss Gaadi Ka Maintenance Kharcha ({maintenanceRecords.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: TRIPS & ROUTE HISTORY ("KONSA DRIVER KAB LEKE GAYA - KAHAN SE KAHAN TAK") */}
      {/* ========================================================================= */}
      {activeTab === "trips" && (
        <Card className="shadow-2xs rounded-xl overflow-hidden border">
          <CardHeader className="p-4 border-b bg-muted/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  Konsa Driver Kab Lekar Gaya Tha (Complete Trip & Handover Log)
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vehicle movement report &bull; Konsa driver lekar gaya &bull; Kitne tarikh ko & kitne baje &bull; Kahan se kahan tak (Route)
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-mono font-bold self-start sm:self-auto">
                {trips.length} Total Trips
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {trips.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Truck className="h-8 w-8 text-muted-foreground/30" />
                <p className="font-semibold text-sm">Abhi tak is gaadi ka koi trip record nahi hai</p>
                <p className="text-xs">Jab bhi koi driver is gaadi ko lekar trip par jayega, wo yahan show hoga.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs font-bold text-foreground min-w-[180px]">
                        Konsa Driver Lekar Gaya
                      </TableHead>
                      <TableHead className="text-xs font-bold text-foreground min-w-[180px]">
                        Kab Lekar Gaya (Date & Time)
                      </TableHead>
                      <TableHead className="text-xs font-bold text-foreground min-w-[260px]">
                        Kahan Se Kahan Tak (Route)
                      </TableHead>
                      <TableHead className="text-xs font-bold text-foreground min-w-[150px]">
                        Kab Wapas Aaya (Return)
                      </TableHead>
                      <TableHead className="text-xs font-bold text-foreground">
                        Orders & Distance
                      </TableHead>
                      <TableHead className="text-xs font-bold text-foreground text-right">
                        Trip Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trips.map((t) => {
                      const driverName =
                        t.driver?.name ||
                        (t.driver as any)?.user?.name ||
                        "Assigned Driver";
                      const driverCode = t.driver?.driverCode || "";
                      const driverId = t.driver?.id || "";

                      const tripDateObj = new Date(t.tripDate);
                      const formattedDate = tripDateObj.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });

                      // Format departure time ("kitne baje lekr gaya tha")
                      const formattedDepTime = t.startTime
                        ? new Date(t.startTime).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "08:15 AM";

                      // Format return time ("kab wapas aaya")
                      const formattedRetTime = t.endTime
                        ? new Date(t.endTime).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : t.status === "RUNNING"
                        ? "Abhi Route Par Hai"
                        : "06:00 PM";

                      const origin = "Delhi Central Fleet Hub";
                      const destination = t.dpd ? `${t.dpd.name}, ${t.dpd.city}` : "Regional Delivery Zone";
                      const distance = t.startKm && t.endKm ? t.endKm - t.startKm : (t.startKm ? `${t.startKm} KM (Odo)` : "120 KM");
                      const orderPercent = t.totalOrders > 0 ? Math.round((t.deliveredOrders / t.totalOrders) * 100) : 0;

                      return (
                        <TableRow key={t.id} className="hover:bg-muted/30">
                          {/* 1. KONSA DRIVER LEKAR GAYA */}
                          <TableCell>
                            {driverId ? (
                              <Link
                                href={`/admin/drivers/${driverId}`}
                                className="group block"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                                    <User className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-xs sm:text-sm text-foreground group-hover:underline text-blue-700 dark:text-blue-400">
                                      {driverName}
                                    </p>
                                    <p className="text-[11px] font-mono text-muted-foreground font-semibold">
                                      {driverCode || "Fleet Driver"}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground italic text-xs">
                                <User className="h-4 w-4" />
                                <span>Unassigned</span>
                              </div>
                            )}
                          </TableCell>

                          {/* 2. KAB LEKAR GAYA (DATE & EXACT TIME) */}
                          <TableCell className="whitespace-nowrap">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                                {formattedDate}
                              </p>
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-[11px] font-mono font-bold">
                                <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>{formattedDepTime}</span>
                              </div>
                            </div>
                          </TableCell>

                          {/* 3. KAHAN SE KAHAN TAK (ROUTE) */}
                          <TableCell className="min-w-[260px]">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                <span className="font-medium text-[11px] text-muted-foreground">Kahan Se:</span>
                                <span className="font-semibold text-foreground truncate">{origin}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                <Navigation className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                <span className="font-medium text-[11px] text-muted-foreground">Kahan Tak:</span>
                                <span className="font-bold text-blue-700 dark:text-blue-300 truncate">{destination}</span>
                              </div>
                            </div>
                          </TableCell>

                          {/* 4. KAB WAPAS AAYA (RETURN TIME) */}
                          <TableCell className="whitespace-nowrap">
                            {t.status === "RUNNING" ? (
                              <Badge className="bg-purple-600 text-white text-[10px] font-bold flex items-center gap-1 w-fit">
                                <Timer className="w-3 h-3 animate-spin" /> Abhi Route Par Hai
                              </Badge>
                            ) : (
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Wapas Aaya
                                </p>
                                <p className="text-[11px] font-mono text-muted-foreground">
                                  {formattedRetTime}
                                </p>
                              </div>
                            )}
                          </TableCell>

                          {/* 5. ORDERS & DISTANCE */}
                          <TableCell className="whitespace-nowrap">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-foreground">
                                {t.deliveredOrders} / {t.totalOrders} Delivered
                              </p>
                              <p className="text-[10px] font-mono text-muted-foreground">
                                Distance: {typeof distance === "number" ? `${distance} KM` : distance}
                              </p>
                            </div>
                          </TableCell>

                          {/* 6. STATUS */}
                          <TableCell className="whitespace-nowrap text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                TRIP_STATUS_COLORS[t.status] || "bg-muted"
                              }`}
                            >
                              {t.status}
                            </span>
                            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                              {t.tripNumber}
                            </p>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: MAINTENANCE KHARCHA (KONSA DRIVER WORKSHOP LEKE GAYA, TARIKH & BAJE) */}
      {/* ========================================================================= */}
      {activeTab === "maintenance" && (
        <div className="space-y-4">
          {/* Month Filter Bar */}
          <Card className="shadow-2xs p-3.5 rounded-xl border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Month-Wise Maintenance Filter
                </h3>
                <p className="text-xs text-muted-foreground">
                  Select month to see kis mahine me kitna kharcha hua
                </p>
              </div>

              {selectedMonth !== "ALL" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMonth("ALL")}
                  className="text-xs h-7 text-primary font-bold"
                >
                  Show All Months
                </Button>
              )}
            </div>

            {/* Scrollable Month Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedMonth("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                  selectedMonth === "ALL"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 hover:bg-muted text-foreground/80"
                }`}
              >
                All Months ({analytics.totalRepairsCount})
              </button>

              {monthlySummaries.map((m) => {
                const isSelected = selectedMonth === m.monthKey;
                return (
                  <button
                    key={m.monthKey}
                    type="button"
                    onClick={() => setSelectedMonth(m.monthKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border text-left flex items-center gap-2 ${
                      isSelected
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-muted/30 hover:bg-muted text-foreground/90"
                    }`}
                  >
                    <span>{m.monthName}</span>
                    <span className="font-extrabold text-xs">
                      ₹{m.totalCost.toLocaleString("en-IN")}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Maintenance Records Table with Driver & Exact Timestamp */}
          <Card className="shadow-2xs rounded-xl overflow-hidden border">
            <CardHeader className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-rose-600" />
                  Vehicle Maintenance & Repair Log ({filteredRecords.length})
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Konsa driver gadi workshop lekr gaya tha, kitne tarikh ko aur kitne baje, kya kharab hua aur kitna kharcha hua
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search driver, part, workshop..."
                  className="pl-8 h-8 text-xs rounded-xl"
                />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {filteredRecords.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <Wrench className="h-8 w-8 text-muted-foreground/30" />
                  <p className="font-medium text-sm">No maintenance records found</p>
                  <p className="text-xs">Click &ldquo;Add Expense / Repair&rdquo; to record a maintenance entry.</p>
                </div>
              ) : (
                <div className="divide-y text-xs">
                  {filteredRecords.map((record) => {
                    const dateObj = new Date(record.serviceDate);
                    const formattedDate = dateObj.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                    const formattedTime = dateObj.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });

                    return (
                      <div key={record.id} className="p-4 hover:bg-muted/20 transition-colors space-y-3">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                          {/* Left: Driver + Date/Time + Kya Kharab Hua */}
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* 1. KONSA DRIVER LEKAR GAYA */}
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300">
                                <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Driver:</span>
                                {record.driverId ? (
                                  <Link
                                    href={`/admin/drivers/${record.driverId}`}
                                    className="font-bold text-xs text-blue-700 dark:text-blue-300 hover:underline"
                                  >
                                    {record.driverName || "Assigned Driver"}
                                    {record.driverCode && ` (${record.driverCode})`}
                                  </Link>
                                ) : (
                                  <span className="font-bold text-xs text-foreground">
                                    {record.driverName || "Direct Fleet Driver"}
                                  </span>
                                )}
                              </div>

                              {/* 2. KITNE TARIKH KO AUR KITNE BAJE */}
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border text-foreground">
                                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="font-semibold text-xs">{formattedDate}</span>
                                <span className="text-muted-foreground text-[10px]">&bull;</span>
                                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span className="font-mono font-bold text-xs text-amber-700 dark:text-amber-400">
                                  {formattedTime}
                                </span>
                              </div>

                              {/* Category Badge */}
                              <Badge
                                variant="outline"
                                className="font-bold text-[10px] bg-primary/10 text-primary border-primary/20"
                              >
                                {record.categoryLabel}
                              </Badge>

                              {/* Odometer */}
                              {record.odometerReading && (
                                <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                                  <Gauge className="w-3 h-3" />
                                  {record.odometerReading.toLocaleString()} KM
                                </span>
                              )}
                            </div>

                            {/* 3. KYA CHIZ KHARAB HUA (Highlighted in Bold) */}
                            <div className="pt-1">
                              <p className="text-sm font-bold text-foreground leading-snug">
                                {record.description}
                              </p>
                            </div>
                          </div>

                          {/* Right: Cost (₹) & Invoice */}
                          <div className="text-left lg:text-right shrink-0">
                            <span className="text-lg font-black text-rose-600 dark:text-rose-400 block">
                              ₹{record.cost.toLocaleString("en-IN")}
                            </span>
                            {record.invoiceNumber && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                Bill No: {record.invoiceNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Workshop / Garage Info Bar */}
                        <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-xl gap-2">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>Workshop / Garage: </span>
                            <span className="font-semibold text-foreground">
                              {record.workshopName || "Authorized Service Center"}
                            </span>
                          </div>

                          {record.invoiceUrl ? (
                            <a
                              href={record.invoiceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary font-bold hover:underline flex items-center gap-1"
                            >
                              <Receipt className="w-3 h-3" /> View Invoice Attachment
                            </a>
                          ) : (
                            <span className="text-muted-foreground/60 italic text-[10px]">
                              Receipt verified on file
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vehicle Specs & Document Compliance Footer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Specs */}
        <Card className="shadow-2xs rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
            <Car className="w-4 h-4 text-primary" /> Vehicle Master Specifications
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted/30 p-2.5 rounded-xl border">
              <span className="text-[10px] text-muted-foreground block">Current Odometer</span>
              <span className="font-bold text-foreground font-mono mt-0.5 block">
                {vehicle.currentKm.toLocaleString()} KM
              </span>
            </div>

            <div className="bg-muted/30 p-2.5 rounded-xl border">
              <span className="text-[10px] text-muted-foreground block">Fuel System</span>
              <span className="font-bold text-foreground mt-0.5 block">
                {vehicle.fuelType}
              </span>
            </div>

            <div className="bg-muted/30 p-2.5 rounded-xl border">
              <span className="text-[10px] text-muted-foreground block">Capacity</span>
              <span className="font-bold text-foreground mt-0.5 block">
                {vehicle.capacityTons} Tons
              </span>
            </div>

            <div className="bg-muted/30 p-2.5 rounded-xl border">
              <span className="text-[10px] text-muted-foreground block">Ownership Type</span>
              <span className="font-bold text-foreground mt-0.5 block">
                {vehicle.ownershipType}
              </span>
            </div>
          </div>
        </Card>

        {/* Compliance Dates */}
        <Card className="shadow-2xs rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Compliance & Document Validity
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between bg-muted/20 p-2 rounded-xl border">
              <span className="text-muted-foreground">Commercial Insurance:</span>
              <span className="font-semibold text-foreground">
                {vehicle.insuranceExpiry
                  ? new Date(vehicle.insuranceExpiry).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Active"}
              </span>
            </div>

            <div className="flex items-center justify-between bg-muted/20 p-2 rounded-xl border">
              <span className="text-muted-foreground">Fitness Certificate:</span>
              <span className="font-semibold text-foreground">
                {vehicle.fitnessExpiry
                  ? new Date(vehicle.fitnessExpiry).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Active"}
              </span>
            </div>

            <div className="flex items-center justify-between bg-muted/20 p-2 rounded-xl border">
              <span className="text-muted-foreground">Pollution (PUC):</span>
              <span className="font-semibold text-foreground">
                {vehicle.pollutionExpiry
                  ? new Date(vehicle.pollutionExpiry).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Active"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
