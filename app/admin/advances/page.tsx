import { requireAuth } from "@/lib/auth/session";
import { getAdvances } from "@/lib/db/admin-service";
import { isDatabaseLive } from "@/lib/db/service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DollarSign, CheckCircle2, Clock, Wallet, CheckCheck, ArrowUpRight } from "lucide-react";
import { AddAdvanceDialog } from "@/components/admin/add-advance-dialog";
import { AdvanceActions } from "@/components/admin/advance-actions";
import Link from "next/link";

interface SearchParams { status?: string; page?: string }

const ADVANCE_TABS = [
  { key: "ALL", label: "All Advances" },
  { key: "APPROVED", label: "Active / Outstanding" },
  { key: "RECOVERED", label: "Settled / Recovered" },
];

export default async function AdvancesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAuth(["SUPER_ADMIN"]);
  const params = await searchParams;
  const dbLive = await isDatabaseLive();

  const page = parseInt(params.page ?? "1", 10);
  const status = params.status ?? "ALL";

  let data: Awaited<ReturnType<typeof getAdvances>> = { advances: [], total: 0, page: 1, totalPages: 1 };

  if (dbLive) {
    try { data = await getAdvances({ status, page }); } catch {}
  }

  // Calculate advance metrics
  const totalGivenSum = data.advances.reduce((s, a) => s + Number(a.amount), 0);
  const activeSum = data.advances.filter(a => a.status === "APPROVED").reduce((s, a) => s + Number(a.amount), 0);
  const settledSum = data.advances.filter(a => a.status === "RECOVERED").reduce((s, a) => s + Number(a.amount), 0);
  const activeCount = data.advances.filter(a => a.status === "APPROVED").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Driver Advances</h1>
          <p className="text-sm text-muted-foreground">
            Direct cash & UPI advances given to drivers · Auto-settled in trip payouts
          </p>
        </div>
        {dbLive && <AddAdvanceDialog />}
      </div>

      {/* KPI Cards (Equal height & width) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Total Advances Disbursed */}
        <Card className="h-full w-full flex flex-col justify-between">
          <CardContent className="p-4 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                Total Advances Given
              </p>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shrink-0">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                ₹{totalGivenSum.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="h-5 flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
              <span>{data.total} total transactions</span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Active / Outstanding Advances */}
        <Card className="h-full w-full flex flex-col justify-between border-2 border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 truncate">
                Active / Outstanding
              </p>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-amber-600">
                ₹{activeSum.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="h-5 flex items-center gap-1.5 overflow-hidden text-xs text-amber-700 dark:text-amber-400">
              <span>{activeCount} active advance{activeCount !== 1 ? "s" : ""}</span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Settled in Payouts */}
        <Card className="h-full w-full flex flex-col justify-between">
          <CardContent className="p-4 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                Settled in Payouts
              </p>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shrink-0">
                <CheckCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-emerald-600">
                ₹{settledSum.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="h-5 flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
              <span>Recovered from earnings</span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Total Records */}
        <Card className="h-full w-full flex flex-col justify-between">
          <CardContent className="p-4 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                Total Records
              </p>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shrink-0">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                {data.total}
              </p>
            </div>
            <div className="h-5 flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
              <span>Page {data.page} of {data.totalPages || 1}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Ledger Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex gap-2 flex-wrap">
            {ADVANCE_TABS.map(tab => (
              <a
                key={tab.key}
                href={`/admin/advances?status=${tab.key}`}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                  status === tab.key
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:bg-muted/40"
                }`}
              >
                {tab.label}
              </a>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {!dbLive ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <DollarSign className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">Database Offline</p>
            </div>
          ) : data.advances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <DollarSign className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">No advances found</p>
              <p className="text-xs text-muted-foreground">Click &ldquo;Give Advance&rdquo; to disburse an advance to any driver.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs font-semibold">Driver</TableHead>
                    <TableHead className="text-xs font-semibold">Advance Amount</TableHead>
                    <TableHead className="text-xs font-semibold">Date Given</TableHead>
                    <TableHead className="text-xs font-semibold">Payment Mode</TableHead>
                    <TableHead className="text-xs font-semibold">Trip Ref</TableHead>
                    <TableHead className="text-xs font-semibold">Purpose & Notes</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold w-16 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.advances.map(advance => (
                    <TableRow key={advance.id}>
                      <TableCell>
                        <Link
                          href={`/admin/drivers/${advance.driver.id}?tab=advances`}
                          className="font-medium text-foreground hover:underline flex flex-col"
                        >
                          <span className="text-sm font-semibold">{advance.driver.user.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{advance.driver.driverCode}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm font-bold text-amber-600 whitespace-nowrap">
                        ₹{Number(advance.amount).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(advance.approvedDate || advance.requestDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="bg-muted px-2 py-0.5 rounded text-[11px] font-mono font-medium">
                          {advance.paymentMode}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {advance.trip?.tripNumber ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {advance.notes ?? "Transit / Route Advance"}
                      </TableCell>
                      <TableCell>
                        {advance.status === "RECOVERED" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
                            SETTLED
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                            GIVEN
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <AdvanceActions advanceId={advance.id} status={advance.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
                  <p className="text-xs text-muted-foreground">
                    Page {data.page} of {data.totalPages} · {data.total} records
                  </p>
                  <div className="flex gap-2">
                    {data.page > 1 && (
                      <a href={`/admin/advances?page=${data.page - 1}&status=${status}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs">Previous</Button>
                      </a>
                    )}
                    {data.page < data.totalPages && (
                      <a href={`/admin/advances?page=${data.page + 1}&status=${status}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs">Next</Button>
                      </a>
                    )}
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
