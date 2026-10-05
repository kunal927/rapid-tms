import { requireAuth } from "@/lib/auth/session";
import { getFuelRecords } from "@/lib/db/admin-service";
import { isDatabaseLive } from "@/lib/db/service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Fuel, Plus, TrendingUp } from "lucide-react";
import { AddFuelDialog } from "@/components/admin/add-fuel-dialog";

interface SearchParams { vehicleId?: string; page?: string }

export default async function FuelPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAuth(["SUPER_ADMIN"]);
  const params = await searchParams;
  const dbLive = await isDatabaseLive();
  const page = parseInt(params.page ?? "1", 10);

  let data: Awaited<ReturnType<typeof getFuelRecords>> = { records: [], total: 0, page: 1, totalPages: 1 };

  if (dbLive) {
    try { data = await getFuelRecords({ page }); } catch {}
  }

  const totalLiters = data.records.reduce((s, r) => s + Number(r.quantityLiters), 0);
  const totalAmount = data.records.reduce((s, r) => s + Number(r.totalAmount), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Fuel Management</h1>
          <p className="text-sm text-muted-foreground">Track all fuel fills, mileage and costs</p>
        </div>
        {dbLive && <AddFuelDialog />}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Records", value: data.total, icon: Fuel, color: "text-blue-600" },
          { label: "Total Litres", value: `${totalLiters.toFixed(1)}L`, icon: Fuel, color: "text-amber-600" },
          { label: "Total Amount", value: `₹${totalAmount.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-red-600" },
        ].map(item => (
          <div key={item.label} className="rounded-xl border p-3 bg-card">
            <item.icon className={`h-5 w-5 mb-1 ${item.color}`} />
            <p className="text-lg font-bold">{dbLive ? item.value : "—"}</p>
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {!dbLive ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Fuel className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">Database Offline</p>
            </div>
          ) : data.records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Fuel className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">No fuel records yet</p>
              <AddFuelDialog trigger={<Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1.5" />Add Fuel Record</Button>} />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Vehicle</TableHead>
                    <TableHead className="text-xs">Driver</TableHead>
                    <TableHead className="text-xs">Litres</TableHead>
                    <TableHead className="text-xs">Rate/L</TableHead>
                    <TableHead className="text-xs">Total</TableHead>
                    <TableHead className="text-xs">Odometer</TableHead>
                    <TableHead className="text-xs">Station</TableHead>
                    <TableHead className="text-xs">Trip</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.records.map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="text-xs">
                        {new Date(record.fuelDate).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-semibold">{record.vehicle.vehicleNumber}</TableCell>
                      <TableCell className="text-xs">{record.driver?.user?.name ?? "—"}</TableCell>
                      <TableCell className="text-xs font-semibold text-amber-600">
                        {Number(record.quantityLiters).toFixed(2)}L
                      </TableCell>
                      <TableCell className="text-xs">₹{Number(record.ratePerLiter).toFixed(2)}</TableCell>
                      <TableCell className="text-sm font-bold">₹{Number(record.totalAmount).toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {record.odometerReading ? `${record.odometerReading.toLocaleString()} km` : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{record.fuelStation ?? "—"}</TableCell>
                      <TableCell className="text-xs font-mono">{record.trip?.tripNumber ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="border-t px-4 py-3 bg-muted/30 flex flex-wrap gap-6 text-xs font-semibold">
                <span>Total Records: {data.total}</span>
                <span className="text-amber-600">Total Litres: {totalLiters.toFixed(2)}L</span>
                <span className="text-red-600">Total Cost: ₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages}</p>
                  <div className="flex gap-2">
                    {data.page > 1 && <a href={`/admin/fuel?page=${data.page - 1}`}><Button variant="outline" size="sm" className="h-7 text-xs">Previous</Button></a>}
                    {data.page < data.totalPages && <a href={`/admin/fuel?page=${data.page + 1}`}><Button variant="outline" size="sm" className="h-7 text-xs">Next</Button></a>}
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
