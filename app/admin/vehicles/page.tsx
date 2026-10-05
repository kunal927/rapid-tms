import { requireAuth } from "@/lib/auth/session";
import { getVehicles } from "@/lib/db/admin-service";
import { isDatabaseLive as dbLiveCheck } from "@/lib/db/service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Car,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Truck,
  ShieldCheck,
  User,
  X,
  Activity,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { VehicleActions } from "@/components/admin/vehicle-actions";
import { AddVehicleDialog } from "@/components/admin/add-vehicle-dialog";

interface SearchParams {
  search?: string;
  status?: string;
  page?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; dotClass: string }
> = {
  AVAILABLE: {
    label: "Available",
    dotClass: "bg-emerald-500",
  },
  ON_TRIP: {
    label: "On Trip",
    dotClass: "bg-blue-500 animate-pulse",
  },
  MAINTENANCE: {
    label: "Maintenance",
    dotClass: "bg-amber-500",
  },
  INACTIVE: {
    label: "Inactive",
    dotClass: "bg-slate-400",
  },
};

const STATUS_OPTIONS = ["ALL", "AVAILABLE", "ON_TRIP", "MAINTENANCE", "INACTIVE"];

function isExpiringSoon(date?: Date | null): boolean {
  if (!date) return false;
  const diff = new Date(date).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}

function isExpired(date?: Date | null): boolean {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAuth(["SUPER_ADMIN"]);
  const params = await searchParams;
  const dbLive = await dbLiveCheck();

  const page = parseInt(params.page ?? "1", 10);
  const search = params.search ?? "";
  const status = params.status ?? "ALL";

  let data: Awaited<ReturnType<typeof getVehicles>> = {
    vehicles: [],
    total: 0,
    page: 1,
    totalPages: 1,
  };

  if (dbLive) {
    try {
      data = await getVehicles({ search, status, page });
    } catch {
      // fallback to empty
    }
  }

  // Count breakdowns
  const availableCount = dbLive
    ? data.vehicles.filter((v) => v.status === "AVAILABLE").length
    : 0;
  const onTripCount = dbLive
    ? data.vehicles.filter((v) => v.status === "ON_TRIP").length
    : 0;
  const maintenanceCount = dbLive
    ? data.vehicles.filter((v) => v.status === "MAINTENANCE").length
    : 0;
  const inactiveCount = dbLive
    ? data.vehicles.filter((v) => v.status === "INACTIVE").length
    : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* White Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Fleet Management
                </h1>
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {data.total} {data.total === 1 ? "Vehicle" : "Vehicles"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Monitor live fleet status, document compliance, maintenance schedules & trip operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <AddVehicleDialog
              trigger={
                <Button className="h-9 px-4 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-xs gap-1.5 rounded-xl transition-all">
                  <Plus className="h-4 w-4" /> Add New Vehicle
                </Button>
              }
            />
          </div>
        </div>
      </div>

      {/* Fleet KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Available Card */}
        <Link
          href="/admin/vehicles?status=AVAILABLE"
          className={`group relative overflow-hidden rounded-2xl border bg-white p-4 transition-all duration-200 hover:shadow-md ${
            status === "AVAILABLE"
              ? "ring-2 ring-emerald-500 border-emerald-500/40"
              : "border-slate-200/90 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Available Fleet</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {dbLive ? availableCount : "—"}
            </span>
            <span className="text-[11px] font-medium text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Available
            </span>
          </div>
        </Link>

        {/* On Trip Card */}
        <Link
          href="/admin/vehicles?status=ON_TRIP"
          className={`group relative overflow-hidden rounded-2xl border bg-white p-4 transition-all duration-200 hover:shadow-md ${
            status === "ON_TRIP"
              ? "ring-2 ring-blue-500 border-blue-500/40"
              : "border-slate-200/90 hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">On Active Trip</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {dbLive ? onTripCount : "—"}
            </span>
            <span className="text-[11px] font-medium text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              On Trip
            </span>
          </div>
        </Link>

        {/* Maintenance Card */}
        <Link
          href="/admin/vehicles?status=MAINTENANCE"
          className={`group relative overflow-hidden rounded-2xl border bg-white p-4 transition-all duration-200 hover:shadow-md ${
            status === "MAINTENANCE"
              ? "ring-2 ring-amber-500 border-amber-500/40"
              : "border-slate-200/90 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">In Maintenance</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {dbLive ? maintenanceCount : "—"}
            </span>
            <span className="text-[11px] font-medium text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Maintenance
            </span>
          </div>
        </Link>

        {/* Inactive Card */}
        <Link
          href="/admin/vehicles?status=INACTIVE"
          className={`group relative overflow-hidden rounded-2xl border bg-white p-4 transition-all duration-200 hover:shadow-md ${
            status === "INACTIVE"
              ? "ring-2 ring-slate-400 border-slate-400/40"
              : "border-slate-200/90 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Inactive / Off Duty</span>
            <div className="h-8 w-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {dbLive ? inactiveCount : "—"}
            </span>
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              Inactive
            </span>
          </div>
        </Link>
      </div>

      {/* Main Vehicle Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Search and Filters Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <form className="relative flex-1 max-w-md" method="get">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              name="search"
              defaultValue={search}
              placeholder="Search by vehicle number, type, or make..."
              className="pl-9 pr-8 h-9 text-xs bg-white border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-slate-900 placeholder:text-slate-400"
            />
            {search && (
              <a
                href={`/admin/vehicles${status !== "ALL" ? `?status=${status}` : ""}`}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </a>
            )}
            {status !== "ALL" && <input type="hidden" name="status" value={status} />}
          </form>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {STATUS_OPTIONS.map((s) => {
              const isActive = status === s;
              const label = s === "ALL" ? "All Fleet" : s.replace("_", " ");

              return (
                <a
                  key={s}
                  href={`/admin/vehicles?status=${s}${search ? `&search=${search}` : ""}`}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap border ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs font-semibold"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Table Content with Vertical Lines */}
        <div className="p-0 overflow-x-auto">
          {!dbLive ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3 bg-white">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <Car className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-900">Database Connection Offline</p>
              <p className="text-xs text-slate-500 max-w-md">
                Please connect your database to view and manage fleet vehicles.
              </p>
            </div>
          ) : data.vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3 bg-white">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center">
                <Car className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-900">No Vehicles Found</p>
              <p className="text-xs text-slate-500 max-w-sm">
                {search || status !== "ALL"
                  ? "No vehicles matched your filter criteria. Try clearing search filters."
                  : "Start by registering your first commercial vehicle to the fleet."}
              </p>
              <AddVehicleDialog
                trigger={
                  <Button size="sm" variant="outline" className="mt-2 text-xs font-semibold rounded-xl border-slate-300">
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Vehicle
                  </Button>
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/90">
                <TableRow className="border-b border-slate-200 hover:bg-transparent">
                  <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider py-3.5 pl-5">
                    Vehicle Registration
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider py-3.5">
                    Type / Specs
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider py-3.5">
                    Live Status
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider py-3.5">
                    Assigned Driver
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider py-3.5 text-center">
                    Trip Count
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider py-3.5">
                    Doc Compliance
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider py-3.5 pr-5 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.vehicles.map((vehicle) => {
                  const currentTrip = vehicle.trips?.[0];
                  const insExpiry = vehicle.insuranceExpiry;
                  const fitExpiry = vehicle.fitnessExpiry;
                  const docWarning =
                    isExpiringSoon(insExpiry) ||
                    isExpiringSoon(fitExpiry) ||
                    isExpired(insExpiry) ||
                    isExpired(fitExpiry);

                  const cfg = STATUS_CONFIG[vehicle.status] ?? STATUS_CONFIG.INACTIVE;

                  return (
                    <TableRow
                      key={vehicle.id}
                      className="group hover:bg-slate-50/80 border-b border-slate-200 transition-colors"
                    >
                      {/* Vehicle Registration Plate (White Badge Style) */}
                      <TableCell className="py-3.5 pl-5">
                        <Link
                          href={`/admin/vehicles/${vehicle.id}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 hover:border-slate-400 font-mono font-bold text-xs shadow-2xs tracking-wider transition-all"
                        >
                          <Car className="h-3.5 w-3.5 text-slate-500" />
                          <span>{vehicle.vehicleNumber}</span>
                          <ArrowUpRight className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </TableCell>

                      {/* Type / Specs */}
                      <TableCell className="py-3.5">
                        <div className="font-semibold text-xs text-slate-900">
                          {vehicle.vehicleType}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          {vehicle.make && (
                            <span>
                              {vehicle.make} {vehicle.model ?? ""}
                            </span>
                          )}
                          {vehicle.capacityTons !== undefined && vehicle.capacityTons !== null && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-mono font-semibold">
                              {Number(vehicle.capacityTons)}T
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Live Status Pill: Black Text with Green/Color Dot Point */}
                      <TableCell className="py-3.5">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-900 shadow-2xs">
                          <span className={`h-2 w-2 rounded-full ${cfg.dotClass}`} />
                          {cfg.label}
                        </span>
                      </TableCell>

                      {/* Assigned Driver */}
                      <TableCell className="py-3.5">
                        {currentTrip?.driver?.user?.name ? (
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                            <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                              <User className="h-3 w-3" />
                            </div>
                            <span className="truncate max-w-[130px]">
                              {currentTrip.driver.user.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </TableCell>

                      {/* Trip Count */}
                      <TableCell className="py-3.5 text-center">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-bold">
                          {vehicle._count?.trips ?? 0}
                        </span>
                      </TableCell>

                      {/* Document Compliance */}
                      <TableCell className="py-3.5">
                        {docWarning ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-amber-700 border border-amber-300 text-[11px] font-semibold">
                            <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
                            Doc Alert
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-emerald-700 border border-emerald-300 text-[11px] font-semibold">
                            <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                            Active
                          </span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/vehicles/${vehicle.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs font-semibold gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 rounded-xl transition-all"
                            >
                              <Wrench className="h-3.5 w-3.5" />
                              Profile & Maintenance
                            </Button>
                          </Link>
                          <VehicleActions
                            vehicleId={vehicle.id}
                            vehicleNumber={vehicle.vehicleNumber}
                            status={vehicle.status}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination Footer */}
        {dbLive && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 bg-slate-50/60">
            <p className="text-xs text-slate-500 font-medium">
              Showing page <span className="font-bold text-slate-800">{data.page}</span> of{" "}
              <span className="font-bold text-slate-800">{data.totalPages}</span> ({data.total} total vehicles)
            </p>
            <div className="flex items-center gap-2">
              {data.page > 1 && (
                <a href={`/admin/vehicles?page=${data.page - 1}&status=${status}&search=${search}`}>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-xl border-slate-200 bg-white hover:bg-slate-100">
                    Previous
                  </Button>
                </a>
              )}
              {data.page < data.totalPages && (
                <a href={`/admin/vehicles?page=${data.page + 1}&status=${status}&search=${search}`}>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-xl border-slate-200 bg-white hover:bg-slate-100">
                    Next
                  </Button>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
