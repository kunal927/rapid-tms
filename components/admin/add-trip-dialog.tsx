"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Truck, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Vehicle { id: string; vehicleNumber: string; vehicleType: string; status: string }
interface Driver { id: string; driverCode: string; perOrderRate: unknown; user: { name: string; phone?: string | null } }
interface Dpd { id: string; code: string; name: string; city: string; ratePerOrderDefault: unknown }

interface AddTripDialogProps {
  trigger?: React.ReactNode;
  vehicles: Vehicle[];
  drivers: Driver[];
  dpds: Dpd[];
}

export function AddTripDialog({ trigger, vehicles, drivers, dpds }: AddTripDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    tripDate: new Date().toISOString().slice(0, 10),
    vehicleId: "", driverId: "", dpdId: "",
    totalOrders: "", perOrderRate: "", dpdAdvance: "", driverAdvance: "", notes: "",
  });

  const selectedVehicle = vehicles.find(v => v.id === form.vehicleId);
  const selectedDriver = drivers.find(d => d.id === form.driverId);
  const selectedDpd = dpds.find(d => d.id === form.dpdId);

  const set = (key: string, value: string) => {
    setForm(f => {
      const updated = { ...f, [key]: value };
      // Auto-fill rate from DPD
      if (key === "dpdId") {
        const dpd = dpds.find(d => d.id === value);
        if (dpd) updated.perOrderRate = String(Number(dpd.ratePerOrderDefault));
      }
      if (key === "driverId") {
        const driver = drivers.find(d => d.id === value);
        if (driver && !f.perOrderRate) updated.perOrderRate = String(Number(driver.perOrderRate));
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.driverId || !form.dpdId || !form.totalOrders) {
      toast.error("Vehicle, driver, DPD and total orders are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          totalOrders: parseInt(form.totalOrders),
          perOrderRate: parseFloat(form.perOrderRate || "0"),
          dpdAdvance: parseFloat(form.dpdAdvance || "0"),
          driverAdvance: parseFloat(form.driverAdvance || "0"),
        }),
      });
      if (res.ok) {
        const trip = await res.json();
        toast.success(`Trip ${trip.tripNumber} created successfully`);
        setOpen(false);
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.message ?? "Failed to create trip");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5 shadow-xs font-semibold">
            <Plus className="h-4 w-4" /> Create Trip
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-6 rounded-2xl border bg-background shadow-xl">
        <DialogHeader className="pb-3 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Create New Trip Dispatch</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Assign vehicle, driver, DPD hub, order rates, and transit advance.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Section 1: Schedule & Resource Assignment */}
            <div className="p-4 rounded-xl border bg-muted/20 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  1. Schedule & Assignment
                </h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Trip Date *</Label>
                  <Input
                    type="date"
                    value={form.tripDate}
                    onChange={e => set("tripDate", e.target.value)}
                    required
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Select Vehicle *</Label>
                  <Select value={form.vehicleId} onValueChange={v => set("vehicleId", v ?? "")}>
                    <SelectTrigger className="w-full bg-background text-xs font-medium">
                      <SelectValue placeholder="Select fleet vehicle">
                        {selectedVehicle ? `${selectedVehicle.vehicleNumber} — ${selectedVehicle.vehicleType} (${selectedVehicle.status})` : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(v => (
                        <SelectItem key={v.id} value={v.id} className="text-xs">
                          {v.vehicleNumber} — {v.vehicleType} ({v.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Assign Driver *</Label>
                  <Select value={form.driverId} onValueChange={v => set("driverId", v ?? "")}>
                    <SelectTrigger className="w-full bg-background text-xs font-medium">
                      <SelectValue placeholder="Select driver">
                        {selectedDriver ? `${selectedDriver.user.name} (${selectedDriver.driverCode}) — ₹${Number(selectedDriver.perOrderRate)}/trip` : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map(d => (
                        <SelectItem key={d.id} value={d.id} className="text-xs">
                          {d.user.name} ({d.driverCode}) — ₹{Number(d.perOrderRate)}/trip
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Destination DPD Hub *</Label>
                  <Select value={form.dpdId} onValueChange={v => set("dpdId", v ?? "")}>
                    <SelectTrigger className="w-full bg-background text-xs font-medium">
                      <SelectValue placeholder="Select DPD destination">
                        {selectedDpd ? `${selectedDpd.name} (${selectedDpd.code}) — ${selectedDpd.city}` : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {dpds.map(d => (
                        <SelectItem key={d.id} value={d.id} className="text-xs">
                          {d.name} ({d.code}) — {d.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Order Rates, Advances & Notes */}
            <div className="p-4 rounded-xl border bg-muted/20 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <DollarSign className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  2. Orders, Rate & Advances
                </h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Total Orders Count *</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 50"
                    value={form.totalOrders}
                    onChange={e => set("totalOrders", e.target.value)}
                    required
                    className="bg-background text-xs font-mono"
                  />
                </div>

                {/* Per Order / Trip Rate Toggle Buttons */}
                <div className="space-y-1.5 p-2.5 rounded-lg border bg-background">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">Trip Price / Rate (₹) *</Label>
                    <span className="text-[10px] text-muted-foreground">Select ₹25 / ₹35</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => set("perOrderRate", "25")}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        form.perOrderRate === "25"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-muted/50 hover:bg-muted text-foreground border-border"
                      }`}
                    >
                      ⚡ ₹25 / Trip
                    </button>
                    <button
                      type="button"
                      onClick={() => set("perOrderRate", "35")}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        form.perOrderRate === "35"
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted/50 hover:bg-muted text-foreground border-border"
                      }`}
                    >
                      ⭐ ₹35 / Trip
                    </button>
                  </div>
                  <Input
                    type="number"
                    step="1"
                    placeholder="Custom rate (e.g. 25 or 35)"
                    value={form.perOrderRate}
                    onChange={e => set("perOrderRate", e.target.value)}
                    required
                    className="h-8 text-xs font-mono font-bold mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">DPD Advance (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={form.dpdAdvance}
                      onChange={e => set("dpdAdvance", e.target.value)}
                      className="bg-background text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Driver Advance (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={form.driverAdvance}
                      onChange={e => set("driverAdvance", e.target.value)}
                      className="bg-background text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Trip Notes</Label>
                  <Textarea
                    placeholder="Special transit instructions..."
                    value={form.notes}
                    onChange={e => set("notes", e.target.value)}
                    rows={2}
                    className="bg-background text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="text-xs font-semibold gap-1.5">
              {loading ? "Creating Trip..." : "Create Trip Dispatch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
