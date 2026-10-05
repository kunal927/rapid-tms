import { requireAuth } from "@/lib/auth/session";
import { getDrivers } from "@/lib/db/admin-service";
import { isDatabaseLive } from "@/lib/db/service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, Users, Eye, Phone, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { AddDriverDialog } from "@/components/admin/add-driver-dialog";
import { DriverActions } from "@/components/admin/driver-actions";

interface SearchParams { search?: string; status?: string; page?: string }

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  ON_TRIP: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  INACTIVE: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

const STATUSES = ["ALL", "ACTIVE", "ON_TRIP", "INACTIVE", "SUSPENDED"];

function isExpiringSoon(date?: Date | null): boolean {
  if (!date) return false;
  const diff = new Date(date).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}

function isExpired(date?: Date | null): boolean {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

export default async function DriversPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAuth(["SUPER_ADMIN"]);
  const params = await searchParams;
  const dbLive = await isDatabaseLive();
  const page = parseInt(params.page ?? "1", 10);
  const search = params.search ?? "";
  const status = params.status ?? "ALL";

  let data: Awaited<ReturnType<typeof getDrivers>> = { drivers: [], total: 0, page: 1, totalPages: 1 };
  if (dbLive) {
    try { data = await getDrivers({ search, status, page }); } catch {}
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Driver Management</h1>
          <p className="text-sm text-muted-foreground">Manage drivers, licenses, assignments, and payments</p>
        </div>
        <AddDriverDialog />
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUSES.filter(s => s !== "ALL").map(s => (
          <a key={s} href={`/admin/drivers?status=${s}`}
            className={`rounded-xl border p-3 text-center hover:shadow-sm transition-shadow ${status === s ? "ring-2 ring-primary" : ""}`}>
            <p className="text-lg font-bold">{dbLive ? data.drivers.filter(d => d.status === s).length : "—"}</p>
            <p className="text-[11px] text-muted-foreground capitalize">{s.replace("_", " ")}</p>
          </a>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <form className="flex-1" method="get">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input name="search" defaultValue={search} placeholder="Search by name, phone, license..." className="pl-9 h-9" />
                {status !== "ALL" && <input type="hidden" name="status" value={status} />}
              </div>
            </form>
            <div className="flex gap-1.5 flex-wrap">
              {STATUSES.map(s => (
                <a key={s} href={`/admin/drivers?status=${s}${search ? `&search=${search}` : ""}`}
                  className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-all ${status === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground/30"}`}>
                  {s === "ALL" ? "All" : s.replace("_", " ")}
                </a>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!dbLive ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <Users className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">Database Offline</p>
              <p className="text-xs text-muted-foreground">Connect MySQL to manage drivers.</p>
            </div>
          ) : data.drivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <Users className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">No drivers found</p>
              <AddDriverDialog trigger={<Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1.5" />Add Driver</Button>} />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Driver</TableHead>
                    <TableHead className="text-xs">Code / License</TableHead>
                    <TableHead className="text-xs">Contact</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">License Exp.</TableHead>
                    <TableHead className="text-xs">Trips</TableHead>
                    <TableHead className="text-xs">Rate</TableHead>
                    <TableHead className="text-xs w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.drivers.map(driver => {
                    const licExpiring = isExpiringSoon(driver.licenseExpiry) || isExpired(driver.licenseExpiry);
                    const initials = driver.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                    return (
                      <TableRow key={driver.id}>
                        <TableCell>
                          <Link href={`/admin/drivers/${driver.id}`} className="flex items-center gap-2.5 group">
                            <Avatar className="h-8 w-8 group-hover:ring-2 group-hover:ring-primary/40 transition-all">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{driver.user.name}</p>
                              <p className="text-xs text-muted-foreground">{driver.user.email}</p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/drivers/${driver.id}`}>
                            <p className="text-xs font-mono font-semibold text-primary hover:underline">{driver.driverCode}</p>
                          </Link>
                          <p className="text-xs text-muted-foreground">{driver.licenseNumber}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {driver.user.phone ?? "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[driver.status]}`}>
                            {driver.status.replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs ${licExpiring ? "text-red-600 font-semibold flex items-center gap-1" : "text-muted-foreground"}`}>
                            {licExpiring && <AlertTriangle className="h-3 w-3" />}
                            {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString("en-IN") : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">{driver._count?.trips ?? 0}</TableCell>
                        <TableCell className="text-xs font-semibold">₹{Number(driver.perOrderRate)}/order</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link href={`/admin/drivers/${driver.id}`}>
                              <Button size="icon" variant="ghost" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                            </Link>
                            <DriverActions driverId={driver.id} driverName={driver.user.name} status={driver.status} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages} · {data.total} drivers</p>
                  <div className="flex gap-2">
                    {data.page > 1 && <a href={`/admin/drivers?page=${data.page - 1}&status=${status}`}><Button variant="outline" size="sm" className="h-7 text-xs">Previous</Button></a>}
                    {data.page < data.totalPages && <a href={`/admin/drivers?page=${data.page + 1}&status=${status}`}><Button variant="outline" size="sm" className="h-7 text-xs">Next</Button></a>}
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
