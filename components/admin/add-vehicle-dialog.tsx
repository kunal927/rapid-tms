"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Car, ShieldCheck, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AddVehicleDialogProps {
  trigger?: React.ReactNode;
}

export function AddVehicleDialog({ trigger }: AddVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    vehicleNumber: "",
    vehicleType: "",
    make: "",
    model: "",
    year: "",
    ownershipType: "OWNED",
    rentalMonthlyAmount: "",
    leaseCycle: "MONTHLY",
    leaseAmount: "",
    capacityTons: "",
    insuranceExpiry: "",
    fitnessExpiry: "",
    permitExpiry: "",
    pollutionExpiry: "",
  });

  const handleChange = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleNumber.trim() || !form.vehicleType.trim()) {
      toast.error("Vehicle number and type are required");
      return;
    }
    setLoading(true);

    let finalOwnership = form.ownershipType;
    if (form.ownershipType === "RENTED" && form.rentalMonthlyAmount) {
      finalOwnership = `RENTED (₹${Number(form.rentalMonthlyAmount).toLocaleString("en-IN")}/mo)`;
    } else if (form.ownershipType === "LEASED" && form.leaseAmount) {
      finalOwnership = `LEASED (₹${Number(form.leaseAmount).toLocaleString("en-IN")}/${form.leaseCycle === "YEARLY" ? "yr" : "mo"})`;
    }

    try {
      const res = await fetch("/api/admin/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ownershipType: finalOwnership,
          year: form.year ? parseInt(form.year) : undefined,
          capacityTons: form.capacityTons ? parseFloat(form.capacityTons) : undefined,
          insuranceExpiry: form.insuranceExpiry || undefined,
          fitnessExpiry: form.fitnessExpiry || undefined,
          permitExpiry: form.permitExpiry || undefined,
          pollutionExpiry: form.pollutionExpiry || undefined,
        }),
      });
      if (res.ok) {
        toast.success(`Vehicle ${form.vehicleNumber} added successfully`);
        setOpen(false);
        setForm({
          vehicleNumber: "", vehicleType: "", make: "", model: "", year: "",
          ownershipType: "OWNED", rentalMonthlyAmount: "", leaseCycle: "MONTHLY", leaseAmount: "",
          capacityTons: "", insuranceExpiry: "", fitnessExpiry: "", permitExpiry: "", pollutionExpiry: ""
        });
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.message ?? "Failed to add vehicle");
      }
    } finally {
      setLoading(false);
    }
  };

  const VEHICLE_TYPES = ["TATA ACE", "TATA 407", "MAHINDRA BOLERO", "EICHER", "TEMPO", "AUTO", "MINI TRUCK", "TRUCK", "OTHER"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5 shadow-xs font-semibold">
            <Plus className="h-4 w-4" /> Add Vehicle
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-6 rounded-2xl border bg-background shadow-xl">
        <DialogHeader className="pb-3 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Add Fleet Vehicle</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Register a new commercial vehicle, set rental/lease financial terms, and record compliance dates.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Section 1: Vehicle Details & Specifications */}
            <div className="p-4 rounded-xl border bg-muted/20 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Car className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  1. Vehicle Registration & Specs
                </h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="vn" className="text-xs font-semibold">Vehicle Number *</Label>
                    <Input
                      id="vn"
                      placeholder="DL-01-AB-1234"
                      value={form.vehicleNumber}
                      onChange={e => handleChange("vehicleNumber", e.target.value.toUpperCase())}
                      required
                      className="bg-background text-xs font-mono uppercase font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="vt" className="text-xs font-semibold">Vehicle Type *</Label>
                    <Select value={form.vehicleType} onValueChange={v => handleChange("vehicleType", v ?? "")}>
                      <SelectTrigger id="vt" className="w-full bg-background text-xs font-medium h-9">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {VEHICLE_TYPES.map(t => (
                          <SelectItem key={t} value={t} className="text-xs font-medium">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Make</Label>
                    <Input
                      placeholder="e.g. TATA"
                      value={form.make}
                      onChange={e => handleChange("make", e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Model</Label>
                    <Input
                      placeholder="e.g. ACE"
                      value={form.model}
                      onChange={e => handleChange("model", e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Mfg Year</Label>
                    <Input
                      type="number"
                      placeholder="2022"
                      value={form.year}
                      onChange={e => handleChange("year", e.target.value)}
                      className="bg-background text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Ownership Type</Label>
                    <Select value={form.ownershipType} onValueChange={v => handleChange("ownershipType", v ?? "OWNED")}>
                      <SelectTrigger className="w-full bg-background text-xs font-medium h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OWNED" className="text-xs">Self Owned (Fleet)</SelectItem>
                        <SelectItem value="RENTED" className="text-xs">Rented (Rental Vehicle)</SelectItem>
                        <SelectItem value="LEASED" className="text-xs">Leased (Lease Agreement)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Payload (Tons)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 1.5"
                      value={form.capacityTons}
                      onChange={e => handleChange("capacityTons", e.target.value)}
                      className="bg-background text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Dynamic Sub-Box: RENTAL Details */}
                {form.ownershipType === "RENTED" && (
                  <div className="p-3 rounded-xl border border-amber-300/80 bg-amber-50/50 dark:bg-amber-950/30 space-y-2 animate-in fade-in-50 duration-150">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-amber-600" />
                        Rental Financial Terms
                      </Label>
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">Monthly Rent</span>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-foreground">Monthly Vehicle Rent (₹) *</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 25000"
                        value={form.rentalMonthlyAmount}
                        onChange={e => handleChange("rentalMonthlyAmount", e.target.value)}
                        className="bg-background text-xs font-mono font-bold"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Dynamic Sub-Box: LEASE Details */}
                {form.ownershipType === "LEASED" && (
                  <div className="p-3 rounded-xl border border-blue-300/80 bg-blue-50/50 dark:bg-blue-950/30 space-y-2.5 animate-in fade-in-50 duration-150">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                        Lease Agreement Financials
                      </Label>
                      <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400">Lease Terms</span>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium text-foreground">Lease Payment Cycle</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleChange("leaseCycle", "MONTHLY")}
                          className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            form.leaseCycle === "MONTHLY"
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "bg-background hover:bg-muted text-foreground border-border"
                          }`}
                        >
                          📅 Monthly Lease
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange("leaseCycle", "YEARLY")}
                          className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            form.leaseCycle === "YEARLY"
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "bg-background hover:bg-muted text-foreground border-border"
                          }`}
                        >
                          📆 Yearly Lease
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-foreground">
                        Lease Charge ({form.leaseCycle === "YEARLY" ? "Per Year ₹" : "Per Month ₹"}) *
                      </Label>
                      <Input
                        type="number"
                        placeholder={form.leaseCycle === "YEARLY" ? "e.g. 300000" : "e.g. 25000"}
                        value={form.leaseAmount}
                        onChange={e => handleChange("leaseAmount", e.target.value)}
                        className="bg-background text-xs font-mono font-bold"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Document & Compliance Expiry Dates */}
            <div className="p-4 rounded-xl border bg-muted/20 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  2. Document Compliance Expiries
                </h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Insurance Expiry</Label>
                    <Input
                      type="date"
                      value={form.insuranceExpiry}
                      onChange={e => handleChange("insuranceExpiry", e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Fitness Expiry</Label>
                    <Input
                      type="date"
                      value={form.fitnessExpiry}
                      onChange={e => handleChange("fitnessExpiry", e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Permit Expiry</Label>
                    <Input
                      type="date"
                      value={form.permitExpiry}
                      onChange={e => handleChange("permitExpiry", e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">PUC / Pollution Expiry</Label>
                    <Input
                      type="date"
                      value={form.pollutionExpiry}
                      onChange={e => handleChange("pollutionExpiry", e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="text-xs font-semibold gap-1.5">
              {loading ? "Adding..." : "Add Vehicle to Fleet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
