import { requireAuth } from "@/lib/auth/session";
import { getOrdersAdmin } from "@/lib/db/admin-service";
import { isDatabaseLive } from "@/lib/db/service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Package, Search, Eye, MapPin, Phone, CheckCircle2, Clock, XCircle } from "lucide-react";
import Link from "next/link";

interface SearchParams { search?: string; status?: string; page?: string; tripId?: string }

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  OUT_FOR_DELIVERY: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  DELIVERED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  RESCHEDULED: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  CANCELLED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

const ORDER_STATUSES = ["ALL", "PENDING", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RESCHEDULED", "CANCELLED"];

const STATUS_ICONS: Record<string, React.ElementType> = {
  PENDING: Clock,
  OUT_FOR_DELIVERY: Package,
  DELIVERED: CheckCircle2,
  FAILED: XCircle,
  RESCHEDULED: Clock,
  CANCELLED: XCircle,
};

export default async function OrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAuth(["SUPER_ADMIN"]);
  const params = await searchParams;
  const dbLive = await isDatabaseLive();

  const page = parseInt(params.page ?? "1", 10);
  const search = params.search ?? "";
  const status = params.status ?? "ALL";

  let data: Awaited<ReturnType<typeof getOrdersAdmin>> = { orders: [], total: 0, page: 1, totalPages: 1 };

  if (dbLive) {
    try { data = await getOrdersAdmin({ search, status, page }); } catch {}
  }

  const statusCounts = ORDER_STATUSES.filter(s => s !== "ALL").reduce((acc, s) => {
    acc[s] = data.orders.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const deliveryRate = data.total > 0
    ? Math.round((data.orders.filter(o => o.status === "DELIVERED").length / data.total) * 100)
    : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Order Management</h1>
          <p className="text-sm text-muted-foreground">Track all delivery orders and their statuses</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl border px-3 py-2 text-center bg-card">
            <p className="text-sm font-bold text-emerald-600">{dbLive ? deliveryRate : "—"}%</p>
            <p className="text-[10px] text-muted-foreground">Delivery Rate</p>
          </div>
          <div className="rounded-xl border px-3 py-2 text-center bg-card">
            <p className="text-sm font-bold">{dbLive ? data.total : "—"}</p>
            <p className="text-[10px] text-muted-foreground">Total Orders</p>
          </div>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex gap-1.5 flex-wrap">
        {ORDER_STATUSES.map(s => {
          const Icon = STATUS_ICONS[s] ?? Package;
          return (
            <a
              key={s}
              href={`/admin/orders?status=${s}${search ? `&search=${search}` : ""}`}
              className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-all flex items-center gap-1 ${
                status === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {s === "ALL" ? "All" : s.replace("_", " ")}
              {s !== "ALL" && dbLive && <span className="ml-0.5 opacity-70">({statusCounts[s] ?? 0})</span>}
            </a>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <form method="get">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input name="search" defaultValue={search} placeholder="Search by order number, customer name, phone..." className="pl-9 h-9" />
              {status !== "ALL" && <input type="hidden" name="status" value={status} />}
            </div>
          </form>
        </CardHeader>

        <CardContent className="p-0">
          {!dbLive ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <Package className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">Database Offline</p>
              <p className="text-xs text-muted-foreground">Connect MySQL to view orders.</p>
            </div>
          ) : data.orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <Package className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">No orders found</p>
              <p className="text-xs text-muted-foreground">
                {search ? "Try a different search term." : "No orders match the current filter."}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Order No.</TableHead>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-xs">Address</TableHead>
                    <TableHead className="text-xs">DPD</TableHead>
                    <TableHead className="text-xs">Trip</TableHead>
                    <TableHead className="text-xs">Driver</TableHead>
                    <TableHead className="text-xs">COD</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs w-16">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold">{order.orderNumber}</span>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{order.recipientName}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Phone className="h-3 w-3" />
                          {order.recipientPhone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-1 text-xs text-muted-foreground max-w-[160px]">
                          <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{order.deliveryAddress}, {order.city}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{order.dpd.name}</TableCell>
                      <TableCell>
                        {order.trip ? (
                          <Link href={`/admin/trips/${order.trip.id}`} className="text-xs font-mono text-primary hover:underline">
                            {order.trip.vehicle.vehicleNumber}
                          </Link>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-xs">{order.trip?.driver?.user?.name ?? "—"}</TableCell>
                      <TableCell className="text-xs font-semibold">
                        {Number(order.codAmount) > 0 ? `₹${Number(order.codAmount)}` : <span className="text-muted-foreground">Prepaid</span>}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[order.status]}`}>
                          {order.status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button size="icon" variant="ghost" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages} · {data.total} orders</p>
                  <div className="flex gap-2">
                    {data.page > 1 && <a href={`/admin/orders?page=${data.page - 1}&status=${status}&search=${search}`}><Button variant="outline" size="sm" className="h-7 text-xs">Previous</Button></a>}
                    {data.page < data.totalPages && <a href={`/admin/orders?page=${data.page + 1}&status=${status}&search=${search}`}><Button variant="outline" size="sm" className="h-7 text-xs">Next</Button></a>}
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
