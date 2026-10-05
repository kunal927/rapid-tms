import { requireAuth } from "@/lib/auth/session";
import { getMaintenanceRecords } from "@/lib/db/admin-service";
import { isDatabaseLive } from "@/lib/db/service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Wrench, Plus, DollarSign } from "lucide-react";
import { AddMaintenanceDialog } from "@/components/admin/add-maintenance-dialog";

interface SearchParams { vehicleId?: string; page?: string }

const SERVICE_COLORS: Record<string, string> = {
  Service: "bg-blue-100 text-blue-800",
  Engine: "bg-red-100 text-red-800",
  Tyre: "bg-amber-100 text-amber-800",
  Battery: "bg-purple-100 text-purple-800",
  Repair: "bg-orange-100 text-orange-800",
  Other: "bg-gray-100 text-gray-700",
};

export default async function MaintenancePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAuth(["SUPER_ADMIN"]);
  const params = await searchParams;
  const dbLive = await isDatabaseLive();
  const page = parseInt(params.page ?? "1", 10);

  let data: Awaited<ReturnType<typeof getMaintenanceRecords>> = { records: [], total: 0, page: 1, totalPages: 1 };

  if (dbLive) {
    try { data = await getMaintenanceRecords({ page }); } catch {}
  }

  const totalCost = data.records.reduce((s, r) => s + Number(r.cost), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Vehicle Maintenance</h1>
          <p className="text-sm text-muted-foreground">Track all vehicle service and repair records</p>
        </div>
        {dbLive && <AddMaintenanceDialog />}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Records", value: data.total, icon: Wrench, color: "text-blue-600" },
          { label: "Total Cost", value: `₹${totalCost.toLocaleString("en-IN")}`, icon: DollarSign, color: "text-red-600" },
          { label: "This Month", value: data.records.filter(r => {
            const d = new Date(r.serviceDate);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length, icon: Wrench, color: "text-amber-600" },
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
              <Wrench className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">Database Offline</p>
            </div>
          ) : data.records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Wrench className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">No maintenance records yet</p>
              <AddMaintenanceDialog trigger={<Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1.5" />Add Record</Button>} />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Vehicle</TableHead>
                    <TableHead className="text-xs">Service Type</TableHead>
                    <TableHead className="text-xs">Cost</TableHead>
                    <TableHead className="text-xs">Odometer</TableHead>
                    <TableHead className="text-xs">Workshop</TableHead>
                    <TableHead className="text-xs">Invoice</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.records.map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="text-xs">
                        {new Date(record.serviceDate).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-semibold">{record.vehicle.vehicleNumber}</TableCell>
                      <TableCell>
                        <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${SERVICE_COLORS[record.serviceType] ?? "bg-gray-100 text-gray-700"}`}>
                          {record.serviceType}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-bold text-red-600">₹{Number(record.cost).toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {record.odometerReading ? `${record.odometerReading.toLocaleString()} km` : "—"}
                      </TableCell>
                      <TableCell className="text-xs">{record.workshopName ?? "—"}</TableCell>
                      <TableCell className="text-xs font-mono">{record.invoiceNumber ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                        {record.description ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="border-t px-4 py-3 bg-muted/30 flex flex-wrap gap-6 text-xs font-semibold">
                <span>Total Records: {data.total}</span>
                <span className="text-red-600">Total Cost: ₹{totalCost.toLocaleString("en-IN")}</span>
              </div>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages}</p>
                  <div className="flex gap-2">
                    {data.page > 1 && <a href={`/admin/maintenance?page=${data.page - 1}`}><Button variant="outline" size="sm" className="h-7 text-xs">Previous</Button></a>}
                    {data.page < data.totalPages && <a href={`/admin/maintenance?page=${data.page + 1}`}><Button variant="outline" size="sm" className="h-7 text-xs">Next</Button></a>}
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
