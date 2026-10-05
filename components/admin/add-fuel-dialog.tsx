"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Vehicle { id: string; vehicleNumber: string; vehicleType: string }
interface Driver { id: string; driverCode: string; user: { name: string } }

export function AddFuelDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const router = useRouter();

  const [form, setForm] = useState({
    vehicleId: "", driverId: "",
    fuelDate: new Date().toISOString().slice(0, 10),
    quantityLiters: "", ratePerLiter: "", fuelStation: "", odometerReading: "",
  });

  useEffect(() => {
    if (open) {
      Promise.all([
        fetch("/api/admin/vehicles?limit=100").then(r => r.json()),
        fetch("/api/admin/drivers?limit=100").then(r => r.json()),
      ]).then(([v, d]) => {
        setVehicles(v.vehicles ?? []);
        setDrivers(d.drivers ?? []);
      }).catch(() => {});
    }
  }, [open]);

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const totalAmount = form.quantityLiters && form.ratePerLiter
    ? (parseFloat(form.quantityLiters) * parseFloat(form.ratePerLiter)).toFixed(2)
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.quantityLiters || !form.ratePerLiter) {
      toast.error("Vehicle, quantity and rate are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/fuel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantityLiters: parseFloat(form.quantityLiters),
          ratePerLiter: parseFloat(form.ratePerLiter),
          totalAmount: parseFloat(totalAmount || "0"),
          odometerReading: form.odometerReading ? parseInt(form.odometerReading) : undefined,
          driverId: form.driverId || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Fuel record added");
        setOpen(false);
        setForm({ vehicleId: "", driverId: "", fuelDate: new Date().toISOString().slice(0, 10), quantityLiters: "", ratePerLiter: "", fuelStation: "", odometerReading: "" });
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.message ?? "Failed to add fuel record");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Fuel Record
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Fuel Record</DialogTitle>
          <DialogDescription>Record a fuel fill-up for a vehicle.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Vehicle *</Label>
            <Select value={form.vehicleId} onValueChange={v => set("vehicleId", v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
              <SelectContent>
                {vehicles.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.vehicleNumber} — {v.vehicleType}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Driver</Label>
            <Select value={form.driverId} onValueChange={v => set("driverId", v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Select driver (optional)" /></SelectTrigger>
              <SelectContent>
                {drivers.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.user.name} ({d.driverCode})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Fuel Date *</Label>
            <Input type="date" value={form.fuelDate} onChange={e => set("fuelDate", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Litres *</Label>
              <Input type="number" step="0.01" placeholder="20.5" value={form.quantityLiters} onChange={e => set("quantityLiters", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Rate/Litre (₹) *</Label>
              <Input type="number" step="0.01" placeholder="95.00" value={form.ratePerLiter} onChange={e => set("ratePerLiter", e.target.value)} required />
            </div>
          </div>
          {totalAmount && (
            <div className="rounded-lg bg-muted/60 p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-xl font-bold text-primary">₹{parseFloat(totalAmount).toLocaleString("en-IN")}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Fuel Station</Label>
              <Input placeholder="HPCL Pump" value={form.fuelStation} onChange={e => set("fuelStation", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Odometer (km)</Label>
              <Input type="number" placeholder="45000" value={form.odometerReading} onChange={e => set("odometerReading", e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Record"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
