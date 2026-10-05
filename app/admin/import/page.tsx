"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, RefreshCw, ChevronRight, Database
} from "lucide-react";
import { toast } from "sonner";

interface ParsedRow {
  rowIndex: number;
  date?: string;
  vehicleNo?: string;
  tripNo?: string;
  driver?: string;
  driverAdvance?: number;
  dpdName?: string;
  dpdAdvance?: number;
  ordersInTrip?: number;
  ordersDelivered?: number;
  perOrder?: number;
  driverPayment?: number;
  errors: string[];
  isDuplicate: boolean;
}

interface ImportResult {
  total: number;
  imported: number;
  duplicates: number;
  failed: number;
  errors: { row: number; message: string }[];
}

type Step = "upload" | "preview" | "importing" | "done";

const EXPECTED_COLUMNS = [
  "Date", "Vehicle No.", "Trip No.", "Driver",
  "Driver Advance", "DPD Name", "DPD Advance",
  "Orders in Trip", "Orders Delivered", "Per Order", "Driver Payment"
];

export default function ImportPage() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".xlsx") && !selectedFile.name.endsWith(".xls")) {
      toast.error("Please upload an Excel file (.xlsx or .xls)");
      return;
    }
    setFile(selectedFile);

    // Parse the Excel file
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/admin/import/parse", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message ?? "Failed to parse Excel file");
        return;
      }
      const parsed = await res.json();
      setRows(parsed.rows);
      setStep("preview");
    } catch {
      toast.error("Failed to read Excel file");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  }, [handleFileSelect]);

  const handleConfirmImport = async () => {
    setStep("importing");
    setImportProgress(0);

    try {
      const validRows = rows.filter(r => r.errors.length === 0 && !r.isDuplicate);
      let imported = 0, failed = 0;
      const errors: { row: number; message: string }[] = [];

      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];
        try {
          const res = await fetch("/api/admin/import/commit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(row),
          });
          if (res.ok) imported++;
          else {
            const err = await res.json();
            errors.push({ row: row.rowIndex, message: err.message });
            failed++;
          }
        } catch {
          errors.push({ row: row.rowIndex, message: "Network error" });
          failed++;
        }
        setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
      }

      const result: ImportResult = {
        total: rows.length,
        imported,
        duplicates: rows.filter(r => r.isDuplicate).length,
        failed: rows.filter(r => r.errors.length > 0).length + failed,
        errors,
      };

      setResult(result);
      setStep("done");
      toast.success(`Import complete: ${imported} rows imported`);
    } catch {
      toast.error("Import failed");
      setStep("preview");
    }
  };

  const reset = () => {
    setStep("upload");
    setFile(null);
    setRows([]);
    setResult(null);
    setImportProgress(0);
  };

  const validRows = rows.filter(r => r.errors.length === 0 && !r.isDuplicate);
  const errorRows = rows.filter(r => r.errors.length > 0);
  const dupRows = rows.filter(r => r.isDuplicate);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Excel Import</h1>
        <p className="text-sm text-muted-foreground">Import existing trip and delivery data from Excel spreadsheets</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs">
        {[
          { key: "upload", label: "1. Upload" },
          { key: "preview", label: "2. Preview & Validate" },
          { key: "importing", label: "3. Import" },
          { key: "done", label: "4. Done" },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
              step === s.key ? "bg-primary text-primary-foreground" :
              ["preview", "importing", "done"].indexOf(step) > i ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
              "bg-muted text-muted-foreground"
            }`}>
              {["preview", "importing", "done"].indexOf(step) > i && <CheckCircle2 className="h-3 w-3" />}
              {s.label}
            </div>
            {i < 3 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Expected Excel Format</CardTitle>
              <CardDescription className="text-xs">Your Excel file should have these columns:</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {EXPECTED_COLUMNS.map(col => (
                  <Badge key={col} variant="secondary" className="text-xs">{col}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-sm font-medium mb-1">Drag & drop your Excel file here</p>
            <p className="text-xs text-muted-foreground mb-4">or click below to browse</p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
              />
              <Button type="button" variant="outline" size="sm" className="gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Browse File
              </Button>
            </label>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium">{file?.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Upload Different File
            </Button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Rows", value: rows.length, color: "text-blue-600" },
              { label: "Valid", value: validRows.length, color: "text-emerald-600" },
              { label: "Duplicates", value: dupRows.length, color: "text-amber-600" },
              { label: "Errors", value: errorRows.length, color: "text-red-600" },
            ].map(item => (
              <div key={item.label} className="rounded-xl border p-3 bg-card text-center">
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-[11px] text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          {errorRows.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-3">
              <p className="text-xs font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Validation Errors ({errorRows.length} rows)
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {errorRows.map(r => (
                  <div key={r.rowIndex} className="text-xs text-red-700 dark:text-red-400">
                    Row {r.rowIndex}: {r.errors.join(", ")}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Preview ({Math.min(rows.length, 20)} of {rows.length} rows)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Row</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Vehicle</TableHead>
                      <TableHead className="text-xs">Trip No.</TableHead>
                      <TableHead className="text-xs">Driver</TableHead>
                      <TableHead className="text-xs">DPD</TableHead>
                      <TableHead className="text-xs">Orders</TableHead>
                      <TableHead className="text-xs">Delivered</TableHead>
                      <TableHead className="text-xs">Rate</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 20).map(row => (
                      <TableRow key={row.rowIndex} className={
                        row.errors.length > 0 ? "bg-red-50/50 dark:bg-red-950/10" :
                        row.isDuplicate ? "bg-amber-50/50 dark:bg-amber-950/10" : ""
                      }>
                        <TableCell className="text-xs font-mono">{row.rowIndex}</TableCell>
                        <TableCell className="text-xs">{row.date ?? "—"}</TableCell>
                        <TableCell className="text-xs font-mono">{row.vehicleNo ?? "—"}</TableCell>
                        <TableCell className="text-xs font-mono">{row.tripNo ?? "—"}</TableCell>
                        <TableCell className="text-xs">{row.driver ?? "—"}</TableCell>
                        <TableCell className="text-xs">{row.dpdName ?? "—"}</TableCell>
                        <TableCell className="text-xs">{row.ordersInTrip ?? "—"}</TableCell>
                        <TableCell className="text-xs">{row.ordersDelivered ?? "—"}</TableCell>
                        <TableCell className="text-xs">₹{row.perOrder ?? "—"}</TableCell>
                        <TableCell>
                          {row.isDuplicate ? (
                            <Badge variant="secondary" className="text-[10px] text-amber-600">Duplicate</Badge>
                          ) : row.errors.length > 0 ? (
                            <Badge variant="secondary" className="text-[10px] text-red-600">Error</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] text-emerald-600">Valid</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {validRows.length} valid rows will be imported. {dupRows.length + errorRows.length} rows will be skipped.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={reset}>Cancel</Button>
              <Button
                size="sm"
                onClick={handleConfirmImport}
                disabled={validRows.length === 0}
                className="gap-1.5"
              >
                <Database className="h-3.5 w-3.5" />
                Import {validRows.length} Rows
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Importing */}
      {step === "importing" && (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <RefreshCw className="h-10 w-10 text-primary mx-auto animate-spin" />
            <p className="font-semibold">Importing data...</p>
            <p className="text-xs text-muted-foreground">Please do not close this page</p>
            <div className="max-w-xs mx-auto space-y-2">
              <Progress value={importProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">{importProgress}% complete</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Done */}
      {step === "done" && result && (
        <div className="space-y-4">
          <Card>
            <CardContent className="py-8 text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <h2 className="text-lg font-bold">Import Complete!</h2>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Rows", value: result.total, color: "text-blue-600" },
              { label: "Imported", value: result.imported, color: "text-emerald-600" },
              { label: "Duplicates", value: result.duplicates, color: "text-amber-600" },
              { label: "Failed", value: result.failed, color: "text-red-600" },
            ].map(item => (
              <div key={item.label} className="rounded-xl border p-4 bg-card text-center">
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          {result.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-red-600 flex items-center gap-2">
                  <XCircle className="h-4 w-4" /> Import Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {result.errors.map((e, i) => (
                    <div key={i} className="text-xs text-red-600">Row {e.row}: {e.message}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button onClick={reset} variant="outline" className="gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              Import Another File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
