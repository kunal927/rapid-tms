import { requireAuth } from "@/lib/auth/session";
import { getDpds } from "@/lib/db/admin-service";
import { isDatabaseLive } from "@/lib/db/service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Search, Building2, Eye, Phone, MapPin, Package, Truck } from "lucide-react";
import Link from "next/link";
import { AddDpdDialog } from "@/components/admin/add-dpd-dialog";
import { DpdActions } from "@/components/admin/dpd-actions";

interface SearchParams { search?: string; page?: string; active?: string }

export default async function DpdsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAuth(["SUPER_ADMIN"]);
  const params = await searchParams;
  const dbLive = await isDatabaseLive();
  const page = parseInt(params.page ?? "1", 10);
  const search = params.search ?? "";

  let data: Awaited<ReturnType<typeof getDpds>> = { dpds: [], total: 0, page: 1, totalPages: 1 };
  if (dbLive) {
    try { data = await getDpds({ search, page }); } catch {}
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">DPD Management</h1>
          <p className="text-sm text-muted-foreground">Manage Delivery Point Distributors, their areas and assignments</p>
        </div>
        <AddDpdDialog />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total DPDs", value: data.total, icon: Building2, color: "text-blue-600" },
          { label: "Active", value: data.dpds.filter(d => d.isActive).length, icon: Building2, color: "text-emerald-600" },
          { label: "Inactive", value: data.dpds.filter(d => !d.isActive).length, icon: Building2, color: "text-gray-500" },
          { label: "Total Orders", value: data.dpds.reduce((s, d) => s + (d._count?.orders ?? 0), 0), icon: Package, color: "text-purple-600" },
        ].map(item => (
          <div key={item.label} className="rounded-xl border p-3 text-center bg-card hover:shadow-sm transition-shadow">
            <item.icon className={`h-5 w-5 mx-auto mb-1 ${item.color}`} />
            <p className="text-lg font-bold">{dbLive ? item.value : "—"}</p>
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <form className="flex-1" method="get">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input name="search" defaultValue={search} placeholder="Search by name, code, city..." className="pl-9 h-9" />
              </div>
            </form>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!dbLive ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">Database Offline</p>
              <p className="text-xs text-muted-foreground">Connect MySQL to manage DPDs.</p>
            </div>
          ) : data.dpds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">No DPDs found</p>
              <p className="text-xs text-muted-foreground">Add your first DPD to get started.</p>
              <AddDpdDialog trigger={<Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1.5" />Add DPD</Button>} />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">DPD</TableHead>
                    <TableHead className="text-xs">Code</TableHead>
                    <TableHead className="text-xs">Location</TableHead>
                    <TableHead className="text-xs">Contact</TableHead>
                    <TableHead className="text-xs">Rate/Order</TableHead>
                    <TableHead className="text-xs">Trips</TableHead>
                    <TableHead className="text-xs">Orders</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.dpds.map(dpd => (
                    <TableRow key={dpd.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{dpd.name}</p>
                            {dpd.contactPerson && <p className="text-xs text-muted-foreground">{dpd.contactPerson}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold bg-muted px-1.5 py-0.5 rounded">{dpd.code}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {dpd.city}{dpd.state ? `, ${dpd.state}` : ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        {dpd.contactPhone ? (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {dpd.contactPhone}
                          </div>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        ₹{Number(dpd.ratePerOrderDefault)}/order
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs">
                          <Truck className="h-3 w-3 text-muted-foreground" />
                          {dpd._count?.trips ?? 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          {dpd._count?.orders ?? 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={dpd.isActive ? "default" : "secondary"} className={`text-[10px] ${dpd.isActive ? "bg-emerald-600" : ""}`}>
                          {dpd.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/dpds/${dpd.id}`}>
                            <Button size="icon" variant="ghost" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                          </Link>
                          <DpdActions dpdId={dpd.id} dpdName={dpd.name} isActive={dpd.isActive} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages} · {data.total} DPDs</p>
                  <div className="flex gap-2">
                    {data.page > 1 && <a href={`/admin/dpds?page=${data.page - 1}&search=${search}`}><Button variant="outline" size="sm" className="h-7 text-xs">Previous</Button></a>}
                    {data.page < data.totalPages && <a href={`/admin/dpds?page=${data.page + 1}&search=${search}`}><Button variant="outline" size="sm" className="h-7 text-xs">Next</Button></a>}
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
