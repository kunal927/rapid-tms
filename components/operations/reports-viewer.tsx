"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, RefreshCw, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";

const REPORT_OPTIONS = [
  { id: "daily-trips", label: "Daily Trip Report" },
  { id: "vehicle-utilization", label: "Vehicle Utilization Report" },
  { id: "driver-trips", label: "Driver Trip Report" },
  { id: "delivery-report", label: "Comprehensive Delivery Report" },
  { id: "pending-delivery", label: "Pending Delivery Report" },
  { id: "failed-delivery", label: "Failed Delivery Exceptions Report" },
  { id: "trip-completion", label: "Trip Completion Report" },
];

export function OperationsReportsViewer() {
  const [reportId, setReportId] = useState("daily-trips");
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ count: number; data: any[] } | null>(null);

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/operations/reports/${reportId}?from=${from}&to=${to}&format=json`);
      if (!res.ok) throw new Error("Failed to load report data");
      const json = await res.json();
      setPreview(json);
    } catch (err: any) {
      toast.error(err.message ?? "Error generating report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const url = `/api/operations/reports/${reportId}?from=${from}&to=${to}&format=excel`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border rounded-xl p-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <Select value={reportId} onValueChange={v => { setReportId(v ?? "daily-trips"); setPreview(null); }}>
            <SelectTrigger className="w-64 text-xs h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_OPTIONS.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">From:</span>
            <Input
              type="date"
              value={from}
              onChange={e => { setFrom(e.target.value); setPreview(null); }}
              className="w-36 h-9 text-xs"
            />
            <span className="text-muted-foreground">To:</span>
            <Input
              type="date"
              value={to}
              onChange={e => { setTo(e.target.value); setPreview(null); }}
              className="w-36 h-9 text-xs"
            />
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchPreview}
            disabled={loading}
            className="h-9 gap-1.5 text-xs"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Generate Preview
          </Button>
        </div>

        <Button
          size="sm"
          onClick={handleExport}
          className="h-9 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" /> Export Excel (.xlsx)
        </Button>
      </div>

      {/* Preview Container */}
      <Card>
        <CardHeader className="py-3.5 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Report Data: {REPORT_OPTIONS.find(r => r.id === reportId)?.label}
            </CardTitle>
            {preview && (
              <span className="text-xs text-muted-foreground font-medium">
                {preview.count} records found ({from} to {to})
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {!preview && !loading && (
            <div className="text-center py-12 text-muted-foreground text-xs">
              Select report parameters above and click <strong>Generate Preview</strong> or <strong>Export Excel</strong>.
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12 gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Compiling database records...
            </div>
          )}

          {preview && preview.data.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-xs">
              No matching records found for this date interval.
            </div>
          )}

          {preview && preview.data.length > 0 && (
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                    <th className="p-2.5 font-semibold">#</th>
                    {Object.keys(preview.data[0])
                      .filter(k => typeof preview.data[0][k] !== "object")
                      .map(k => (
                        <th key={k} className="p-2.5 font-semibold uppercase text-[10px]">
                          {k}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {preview.data.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="p-2.5 text-muted-foreground">{idx + 1}</td>
                      {Object.keys(row)
                        .filter(k => typeof row[k] !== "object")
                        .map(k => (
                          <td key={k} className="p-2.5 font-medium">
                            {String(row[k] ?? "-")}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.data.length > 50 && (
                <p className="text-center text-[11px] text-muted-foreground py-2 border-t">
                  Showing first 50 rows. Download Excel for complete manifest.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
