"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wrench,
  Plus,
  Loader2,
  Calendar,
  Building2,
  Receipt,
  Camera,
  Gauge,
} from "lucide-react";
import { toast } from "sonner";

interface AddVehicleExpenseDialogProps {
  vehicleId: string;
  vehicleNumber: string;
  currentKm?: number;
  triggerButton?: React.ReactNode;
}

const REPAIR_CATEGORIES = [
  { value: "CLUTCH", label: "⚙️ Clutch & Transmission" },
  { value: "BRAKES", label: "🛑 Brakes & Hydraulics" },
  { value: "TYRES", label: "🛞 Tyres & Alignment" },
  { value: "ENGINE", label: "🛠️ Engine & Cooling System" },
  { value: "ELECTRICAL", label: "⚡ Electrical & Wiring" },
  { value: "BATTERY", label: "🔋 Battery Replacement" },
  { value: "SUSPENSION", label: "🚗 Suspension & Leaf Springs" },
  { value: "ROUTINE_SERVICE", label: "🛢️ Periodic Oil & Filter Service" },
  { value: "BODYWORK", label: "🔨 Body Repair, Denting & Paint" },
  { value: "ACCIDENTAL", label: "💥 Accidental Repair Work" },
  { value: "MISC", label: "📦 Other Vehicle Expense" },
];

export function AddVehicleExpenseDialog({
  vehicleId,
  vehicleNumber,
  currentKm,
  triggerButton,
}: AddVehicleExpenseDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [serviceDate, setServiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [serviceTime, setServiceTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [driverId, setDriverId] = useState("");
  const [drivers, setDrivers] = useState<Array<{ id: string; driverCode: string; user: { name: string } }>>([]);
  const [serviceType, setServiceType] = useState("CLUTCH");
  const [cost, setCost] = useState("");
  const [odometerReading, setOdometerReading] = useState(currentKm ? String(currentKm) : "");
  const [workshopName, setWorkshopName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [description, setDescription] = useState("");
  const [invoicePreview, setInvoicePreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      fetch("/api/admin/drivers?limit=100")
        .then((r) => r.json())
        .then((d) => setDrivers(d.drivers ?? []))
        .catch(() => {});
    }
  }, [open]);

  const handleBillUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setInvoicePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cost || Number(cost) <= 0) {
      toast.error("Please enter a valid expense amount");
      return;
    }

    if (!description.trim()) {
      toast.error("Please describe what broke down or the repair work done");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: driverId || undefined,
          serviceDate,
          serviceTime,
          serviceType,
          cost: Number(cost),
          odometerReading: odometerReading ? Number(odometerReading) : undefined,
          workshopName,
          invoiceNumber,
          invoiceUrl: invoicePreview,
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to record expense");
      }

      toast.success(`₹${Number(cost).toLocaleString("en-IN")} Expense Logged!`, {
        description: `Recorded for ${vehicleNumber} under ${serviceType}.`,
      });

      setOpen(false);
      setCost("");
      setDescription("");
      setWorkshopName("");
      setInvoiceNumber("");
      setInvoicePreview(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save vehicle expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-1.5 shadow-xs">
            <Plus className="h-4 w-4" /> Add Expense / Repair
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full p-4 sm:p-6 rounded-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="text-left pb-2 border-b">
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <Wrench className="h-5 w-5" />
            <DialogTitle className="text-base font-bold text-foreground">
              Add Vehicle Expense / Repair ({vehicleNumber})
            </DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Log parts damaged, maintenance costs, garage bills, and monthly repair expenses.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          {/* Driver & Repair Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Konsa Driver Leke Gaya Tha (Driver)</Label>
              <Select value={driverId} onValueChange={(val) => setDriverId(val ?? "")}>
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue placeholder="Select driver who took vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="text-xs">
                      {d.user.name} ({d.driverCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Repair / Expense Category</Label>
              <Select value={serviceType} onValueChange={(val) => val && setServiceType(val)}>
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue placeholder="Select repair category" />
                </SelectTrigger>
                <SelectContent>
                  {REPAIR_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tarikh & Kitne Baje (Date & Time) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Tarikh (Service Date)
              </Label>
              <Input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                required
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <span>⏰ Kitne Baje (Time)</span>
              </Label>
              <Input
                type="time"
                value={serviceTime}
                onChange={(e) => setServiceTime(e.target.value)}
                required
                className="h-10 text-xs font-mono"
              />
            </div>
          </div>

          {/* Kya Chiz Kharab Hua (What Broke / Description) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-between">
              <span>Kya Chiz Kharab Hua? (Fault & Repair Details) *</span>
              <span className="text-[10px] text-muted-foreground">Required</span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Clutch plate jal gya highway pe, new Valeo clutch disc and pressure plate set dalwaya. Or front tyre puncture ho kar phat gya naya MRF tyre lagaya."
              rows={3}
              required
              className="text-xs leading-relaxed"
            />
          </div>

          {/* Cost & Odometer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Total Cost / Expense (₹) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-muted-foreground">₹</span>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="e.g. 8500"
                  required
                  className="pl-7 h-10 text-sm font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-muted-foreground" /> Odometer Reading (KM)
              </Label>
              <Input
                type="number"
                value={odometerReading}
                onChange={(e) => setOdometerReading(e.target.value)}
                placeholder="e.g. 48250"
                className="h-10 text-xs font-mono"
              />
            </div>
          </div>

          {/* Workshop & Invoice Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" /> Garage / Workshop Name
              </Label>
              <Input
                value={workshopName}
                onChange={(e) => setWorkshopName(e.target.value)}
                placeholder="e.g. Sharma Auto Garage, Mahipalpur"
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-muted-foreground" /> Bill / Invoice No.
              </Label>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g. INV-2026-891"
                className="h-10 text-xs font-mono"
              />
            </div>
          </div>

          {/* Bill Photo Upload */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span>Garage Bill / Receipt Photo (Optional)</span>
              <span className="text-[10px] text-muted-foreground">Camera / Upload</span>
            </Label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="h-10 border rounded-xl flex items-center justify-center gap-2 text-xs font-medium bg-muted/20 hover:bg-muted/40 transition-colors">
                  <Camera className="w-4 h-4 text-primary" />
                  <span>{invoicePreview ? "Change Bill Photo" : "Upload Workshop Bill Photo"}</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleBillUpload}
                />
              </label>
              {invoicePreview && (
                <img
                  src={invoicePreview}
                  alt="Invoice"
                  className="h-10 w-10 rounded-lg object-cover border"
                />
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={loading || !cost || !description.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-xs rounded-xl touch-manipulation shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving Expense...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Record Vehicle Expense
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
