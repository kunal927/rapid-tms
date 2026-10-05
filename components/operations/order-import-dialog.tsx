"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OrderImportDialogProps {
  trips: { id: string; tripNumber: string; vehicleNumber: string; driverName: string }[];
  defaultTripId?: string;
  trigger?: React.ReactNode;
}

export function OrderImportDialog({ trips, defaultTripId, trigger }: OrderImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [tripId, setTripId] = useState(defaultTripId ?? (trips[0]?.id ?? ""));
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please choose an Excel file (.xlsx)");
      return;
    }
    if (!tripId) {
      toast.error("Please select a target trip to assign imported orders.");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tripId", tripId);

    try {
      const res = await fetch("/api/operations/orders/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Order import failed");

      setResult({
        imported: data.imported,
        skipped: data.skipped,
        errors: data.errors ?? [],
      });

      toast.success(`Successfully imported ${data.imported} orders!`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Error importing orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <Upload className="h-3.5 w-3.5" /> Import Orders (Excel)
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Import Orders from Excel
          </DialogTitle>
          <DialogDescription>
            Upload an Excel (.xlsx / .xls) manifest to batch add orders into a trip dispatch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Assign to Trip *</Label>
            <Select value={tripId} onValueChange={v => setTripId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select target trip" />
              </SelectTrigger>
              <SelectContent>
                {trips.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.tripNumber} ({t.vehicleNumber} • {t.driverName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Select Excel File *</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              {file ? (
                <div>
                  <p className="text-xs font-semibold text-primary">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {(file.size / 1024).toFixed(1)} KB • Click to choose another
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium">Click to browse or drop .xlsx file here</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Columns supported: Order ID, Customer Name, Phone, Address, City, Pincode, Package, COD
                  </p>
                </div>
              )}
            </div>
          </div>

          {result && (
            <div className="space-y-2 rounded-xl bg-muted/40 p-3.5 border text-xs">
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> {result.imported} orders imported
                </span>
                {result.skipped > 0 && (
                  <span className="text-amber-600">{result.skipped} duplicates skipped</span>
                )}
              </div>

              {result.errors.length > 0 && (
                <div className="pt-2 border-t space-y-1">
                  <p className="font-semibold text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Errors encountered ({result.errors.length}):
                  </p>
                  <div className="max-h-28 overflow-y-auto space-y-0.5 text-[11px] text-muted-foreground">
                    {result.errors.map((err, i) => (
                      <p key={i} className="text-red-500">• {err}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            {result ? "Close" : "Cancel"}
          </Button>
          <Button
            onClick={handleImport}
            disabled={loading || !file || !tripId}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import Manifest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
