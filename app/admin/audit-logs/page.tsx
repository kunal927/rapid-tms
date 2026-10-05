import { requireAuth } from "@/lib/auth/session";
import { getAuditLogsAdmin } from "@/lib/db/admin-service";
import { isDatabaseLive } from "@/lib/db/service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Search } from "lucide-react";

interface SearchParams { userId?: string; entity?: string; action?: string; page?: string; dateFrom?: string; dateTo?: string }

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  APPROVE: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  REJECT: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  LOGIN: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default async function AuditLogsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAuth(["SUPER_ADMIN"]);
  const params = await searchParams;
  const dbLive = await isDatabaseLive();

  const page = parseInt(params.page ?? "1", 10);
  const action = params.action ?? "";
  const entity = params.entity ?? "";

  let data: Awaited<ReturnType<typeof getAuditLogsAdmin>> = { logs: [], total: 0, page: 1, totalPages: 1 };

  if (dbLive) {
    try {
      data = await getAuditLogsAdmin({
        entity: entity || undefined,
        action: action || undefined,
        page,
      });
    } catch {}
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">Complete system activity trail for accountability</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl border px-3 py-2 bg-card text-center">
            <p className="text-sm font-bold">{dbLive ? data.total : "—"}</p>
            <p className="text-[10px] text-muted-foreground">Total Events</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <form method="get" className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input name="action" defaultValue={action} placeholder="Filter by action..." className="pl-9 h-9" />
            </div>
            <Input name="entity" defaultValue={entity} placeholder="Filter by entity (Vehicle, Driver...)" className="flex-1 min-w-[180px] h-9" />
            <Button type="submit" size="sm" className="h-9">Filter</Button>
            {(action || entity) && (
              <a href="/admin/audit-logs">
                <Button type="button" variant="outline" size="sm" className="h-9">Clear</Button>
              </a>
            )}
          </form>
        </CardHeader>

        <CardContent className="p-0">
          {!dbLive ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <ShieldCheck className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">Database Offline</p>
            </div>
          ) : data.logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <ShieldCheck className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">No audit logs found</p>
              <p className="text-xs text-muted-foreground">System events will appear here as they occur.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date / Time</TableHead>
                    <TableHead className="text-xs">User</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                    <TableHead className="text-xs">Entity</TableHead>
                    <TableHead className="text-xs">Entity ID</TableHead>
                    <TableHead className="text-xs">IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.logs.map((log: any) => {
                    const actionKey = Object.keys(ACTION_COLORS).find(k => log.action?.toUpperCase().includes(k)) ?? "LOGIN";
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          <div>{new Date(log.createdAt).toLocaleDateString("en-IN")}</div>
                          <div>{new Date(log.createdAt).toLocaleTimeString("en-IN")}</div>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-medium">{log.user?.name ?? "System"}</p>
                          <p className="text-xs text-muted-foreground">{log.user?.role ?? ""}</p>
                        </TableCell>
                        <TableCell>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${ACTION_COLORS[actionKey] ?? "bg-gray-100 text-gray-700"}`}>
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{log.entity}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {log.entityId ? log.entityId.slice(0, 12) + "..." : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{log.ipAddress ?? "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages} · {data.total} events</p>
                  <div className="flex gap-2">
                    {data.page > 1 && <a href={`/admin/audit-logs?page=${data.page - 1}&action=${action}&entity=${entity}`}><Button variant="outline" size="sm" className="h-7 text-xs">Previous</Button></a>}
                    {data.page < data.totalPages && <a href={`/admin/audit-logs?page=${data.page + 1}&action=${action}&entity=${entity}`}><Button variant="outline" size="sm" className="h-7 text-xs">Next</Button></a>}
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
