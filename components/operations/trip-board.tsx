"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Truck,
  Car,
  User,
  Building2,
  Clock,
  Package,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  RefreshCw,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TripActions } from "./trip-actions";

export interface BoardTrip {
  id: string;
  tripNumber: string;
  tripDate: Date | string;
  status: string;
  startTime?: Date | string | null;
  endTime?: Date | string | null;
  updatedAt: Date | string;
  calculatedTotalOrders: number;
  calculatedDeliveredOrders: number;
  calculatedPendingOrders: number;
  calculatedFailedOrders: number;
  totalOrders: number;
  deliveredOrders: number;
  failedOrders: number;
  vehicle: {
    id: string;
    vehicleNumber: string;
    vehicleType: string;
    status: string;
  };
  driver: {
    id: string;
    driverCode: string;
    status: string;
    user: {
      name: string;
      phone: string | null;
    };
  };
  dpd: {
    id: string;
    code: string;
    name: string;
    city: string;
  };
}

interface TripBoardProps {
  initialTrips: BoardTrip[];
  drivers: { id: string; name: string }[];
  vehicles: { id: string; vehicleNumber: string }[];
  dpds: { id: string; name: string }[];
}

const BOARD_COLUMNS = [
  { key: "ASSIGNED", label: "Assigned / Ready", color: "border-blue-500/50 bg-blue-500/5 text-blue-700 dark:text-blue-300" },
  { key: "STARTED", label: "Started / Loading", color: "border-amber-500/50 bg-amber-500/5 text-amber-700 dark:text-amber-300" },
  { key: "RUNNING", label: "Running / En Route", color: "border-purple-500/50 bg-purple-500/5 text-purple-700 dark:text-purple-300" },
  { key: "COMPLETED", label: "Completed", color: "border-emerald-500/50 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300" },
];

export function TripBoard({ initialTrips, drivers, vehicles, dpds }: TripBoardProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [driverFilter, setDriverFilter] = useState("ALL");
  const [vehicleFilter, setVehicleFilter] = useState("ALL");
  const [dpdFilter, setDpdFilter] = useState("ALL");

  const filteredTrips = initialTrips.filter(t => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        t.tripNumber.toLowerCase().includes(q) ||
        t.vehicle.vehicleNumber.toLowerCase().includes(q) ||
        t.driver.user.name.toLowerCase().includes(q) ||
        t.dpd.name.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (driverFilter !== "ALL" && t.driver.id !== driverFilter) return false;
    if (vehicleFilter !== "ALL" && t.vehicle.id !== vehicleFilter) return false;
    if (dpdFilter !== "ALL" && t.dpd.id !== dpdFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Board Filters bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border rounded-xl p-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative w-48 sm:w-60">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search trip, driver, vehicle..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <Select value={driverFilter} onValueChange={v => setDriverFilter(v ?? "ALL")}>
            <SelectTrigger className="h-9 text-xs w-36">
              <SelectValue placeholder="All Drivers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Drivers</SelectItem>
              {drivers.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={vehicleFilter} onValueChange={v => setVehicleFilter(v ?? "ALL")}>
            <SelectTrigger className="h-9 text-xs w-36">
              <SelectValue placeholder="All Vehicles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Vehicles</SelectItem>
              {vehicles.map(v => (
                <SelectItem key={v.id} value={v.id}>{v.vehicleNumber}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dpdFilter} onValueChange={v => setDpdFilter(v ?? "ALL")}>
            <SelectTrigger className="h-9 text-xs w-36">
              <SelectValue placeholder="All DPDs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All DPDs</SelectItem>
              {dpds.map(dpd => (
                <SelectItem key={dpd.id} value={dpd.id}>{dpd.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.refresh()}
          className="h-9 text-xs gap-1.5 shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Board
        </Button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {BOARD_COLUMNS.map(col => {
          const colTrips = filteredTrips.filter(t => {
            if (col.key === "RUNNING") {
              return t.status === "RUNNING";
            }
            if (col.key === "STARTED") {
              return t.status === "STARTED";
            }
            if (col.key === "ASSIGNED") {
              return t.status === "ASSIGNED" || t.status === "DRAFT";
            }
            if (col.key === "COMPLETED") {
              return t.status === "COMPLETED";
            }
            return false;
          });

          return (
            <div
              key={col.key}
              className="flex flex-col rounded-xl border bg-muted/20 p-3 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    col.key === "ASSIGNED" ? "bg-blue-500" :
                    col.key === "STARTED" ? "bg-amber-500" :
                    col.key === "RUNNING" ? "bg-purple-500" : "bg-emerald-500"
                  }`} />
                  <h3 className="font-semibold text-xs tracking-tight">{col.label}</h3>
                </div>
                <Badge variant="secondary" className="text-[11px] font-bold px-2 py-0.5">
                  {colTrips.length}
                </Badge>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTrips.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center text-muted-foreground/60 rounded-lg border border-dashed border-muted-foreground/20 p-4">
                    <p className="text-xs">No trips in this stage</p>
                  </div>
                ) : (
                  colTrips.map(trip => {
                    const total = trip.calculatedTotalOrders || trip.totalOrders || 0;
                    const delivered = trip.calculatedDeliveredOrders || trip.deliveredOrders || 0;
                    const pending = trip.calculatedPendingOrders || Math.max(0, total - delivered);
                    const pct = total > 0 ? Math.round((delivered / total) * 100) : 0;

                    return (
                      <Card
                        key={trip.id}
                        className="shadow-2xs border hover:border-foreground/20 transition-all bg-card"
                      >
                        <CardHeader className="p-3.5 pb-2">
                          <div className="flex items-center justify-between gap-2">
                            <Link
                              href={`/operations/trips/${trip.id}`}
                              className="font-bold text-xs hover:underline text-primary flex items-center gap-1"
                            >
                              <Truck className="h-3.5 w-3.5" />
                              {trip.tripNumber}
                            </Link>
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase font-semibold px-1.5 py-0"
                            >
                              {trip.status}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="p-3.5 pt-0 space-y-2.5 text-xs">
                          {/* Vehicle & Driver */}
                          <div className="space-y-1 text-muted-foreground">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 font-medium text-foreground">
                                <Car className="h-3.5 w-3.5 text-blue-500" />
                                {trip.vehicle.vehicleNumber}
                              </span>
                              <span className="text-[11px]">{trip.vehicle.vehicleType}</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-amber-500" />
                                {trip.driver.user.name}
                              </span>
                              {trip.driver.user.phone && (
                                <span className="text-[10px] text-muted-foreground">{trip.driver.user.phone}</span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                              <span>{trip.dpd.name} ({trip.dpd.city})</span>
                            </div>
                          </div>

                          {/* Fulfillment Progress */}
                          <div className="space-y-1.5 pt-1 border-t">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Package className="h-3 w-3" /> Orders
                              </span>
                              <span className="font-semibold">
                                {delivered} / {total} ({pct}%)
                              </span>
                            </div>
                            <Progress value={pct} className="h-1.5" />
                            {pending > 0 && (
                              <p className="text-[10px] text-muted-foreground text-right">
                                {pending} remaining
                              </p>
                            )}
                          </div>

                          {/* Timestamps & Actions footer */}
                          <div className="flex items-center justify-between pt-2 border-t text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {trip.startTime ? (
                                <span>Started {new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              ) : (
                                <span>Updated {new Date(trip.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              )}
                            </div>

                            <TripActions trip={trip} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
