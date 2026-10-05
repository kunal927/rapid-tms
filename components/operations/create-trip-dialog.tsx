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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Truck, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface VehicleOption {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  currentKm: number;
}

interface DriverOption {
  id: string;
  driverCode: string;
  user: { name: string; phone: string | null };
}

interface DpdOption {
  id: string;
  code: string;
  name: string;
  city: string;
}

interface CreateTripDialogProps {
  vehicles: VehicleOption[];
  drivers: DriverOption[];
  dpds: DpdOption[];
  trigger?: React.ReactNode;
}

export function CreateTripDialog({
  vehicles,
  drivers,
  dpds,
  trigger,
}: CreateTripDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    tripDate: new Date().toISOString().slice(0, 10),
    tripNumber: "",
    vehicleId: "",
    driverId: "",
    dpdId: "",
    startKm: "",
    notes: "",
  });

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleVehicleSelect = (vehicleId: string) => {
    const selected = vehicles.find(v => v.id === vehicleId);
    setForm(f => ({
      ...f,
      vehicleId,
      startKm: selected?.currentKm ? String(selected.currentKm) : f.startKm,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.vehicleId || !form.driverId || !form.dpdId) {
      toast.error("Vehicle, Driver and DPD are all required to create a trip.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/operations/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to create trip");

      toast.success(`Trip ${data.tripNumber} created & assigned successfully!`);
      setOpen(false);
      setForm({
        tripDate: new Date().toISOString().slice(0, 10),
        tripNumber: "",
        vehicleId: "",
        driverId: "",
        dpdId: "",
        startKm: "",
        notes: "",
      });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Error creating trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="h-4 w-4" /> Create Trip Dispatch
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-amber-600" />
            Dispatch New Trip
          </DialogTitle>
          <DialogDescription>
            Assign an eligible vehicle, active driver, and target DPD to start daily route operations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Trip Date *</Label>
              <Input
                type="date"
                value={form.tripDate}
                onChange={e => set("tripDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Trip Number (Optional)</Label>
              <Input
                placeholder="Auto-generated if blank"
                value={form.tripNumber}
                onChange={e => set("tripNumber", e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Vehicle (Available Only) *</Label>
            {vehicles.length === 0 ? (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                No vehicles currently available. All are either on trip, in maintenance, or inactive.
              </div>
            ) : (
              <Select value={form.vehicleId} onValueChange={v => handleVehicleSelect(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select available vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.vehicleNumber} — {v.vehicleType} ({v.currentKm} km)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Driver (Active & Available Only) *</Label>
            {drivers.length === 0 ? (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                No active drivers currently available.
              </div>
            ) : (
              <Select value={form.driverId} onValueChange={v => set("driverId", v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select available driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map(d => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.user.name} ({d.driverCode}) {d.user.phone ? `• ${d.user.phone}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">DPD Hub *</Label>
              <Select value={form.dpdId} onValueChange={v => set("dpdId", v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select DPD" />
                </SelectTrigger>
                <SelectContent>
                  {dpds.map(d => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} ({d.code}) — {d.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Starting Odometer (km)</Label>
              <Input
                type="number"
                placeholder="e.g. 45000"
                value={form.startKm}
                onChange={e => set("startKm", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Route / Dispatch Notes</Label>
            <Textarea
              placeholder="Starting point, delivery cluster, special instructions..."
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || vehicles.length === 0 || drivers.length === 0}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Dispatch & Assign Trip
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
