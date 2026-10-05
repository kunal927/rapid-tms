"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Play } from "lucide-react";
import { toast } from "sonner";

interface ReportViewerProps {
  reportId: string;
  reportLabel: string;
  dbLive: boolean;
}

export function ReportViewer({ reportId, reportLabel, dbLive }: ReportViewerProps) {
  const [from, setFrom] = useState(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: "excel" | "preview") => {
    if (!dbLive) {
      toast.error("Database is offline. Cannot generate report.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}?from=${from}&to=${to}&format=${format}`);
      if (!res.ok) {
        toast.error("Failed to generate report");
        return;
      }
      if (format === "excel") {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${reportLabel.replace(/\s+/g, "_")}_${from}_to_${to}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`${reportLabel} downloaded successfully`);
      } else {
        const data = await res.json();
        toast.success(`Report generated: ${data.rowCount ?? 0} rows`);
      }
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px] font-semibold text-muted-foreground">FROM</Label>
          <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-8 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-semibold text-muted-foreground">TO</Label>
          <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="h-8 text-xs" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-8 text-xs gap-1.5"
          onClick={() => handleExport("preview")}
          disabled={loading || !dbLive}
        >
          <Play className="h-3 w-3" />
          Preview
        </Button>
        <Button
          size="sm"
          className="flex-1 h-8 text-xs gap-1.5"
          onClick={() => handleExport("excel")}
          disabled={loading || !dbLive}
        >
          <Download className="h-3 w-3" />
          Excel
        </Button>
      </div>
    </div>
  );
}
