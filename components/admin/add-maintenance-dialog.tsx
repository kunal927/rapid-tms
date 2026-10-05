"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Vehicle { id: string; vehicleNumber: string; vehicleType: string }

const SERVICE_TYPES = ["Service", "Engine", "Tyre", "Battery", "Repair", "Other"];

export function AddMaintenanceDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const router = useRouter();

  const [form, setForm] = useState({
    vehicleId: "", serviceDate: new Date().toISOString().slice(0, 10),
    serviceType: "", cost: "", odometerReading: "", workshopName: "",
    invoiceNumber: "", description: "",
  });

  useEffect(() => {
    if (open) {
      fetch("/api/admin/vehicles?limit=100")
        .then(r => r.json())
        .then(d => setVehicles(d.vehicles ?? []))
        .catch(() => {});
    }
  }, [open]);

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.serviceType || !form.cost) {
      toast.error("Vehicle, service type and cost are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cost: parseFloat(form.cost),
          odometerReading: form.odometerReading ? parseInt(form.odometerReading) : undefined,
          serviceDate: new Date(form.serviceDate),
        }),
      });
      if (res.ok) {
        toast.success("Maintenance record added");
        setOpen(false);
        setForm({ vehicleId: "", serviceDate: new Date().toISOString().slice(0, 10), serviceType: "", cost: "", odometerReading: "", workshopName: "", invoiceNumber: "", description: "" });
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.message ?? "Failed to save record");
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
            <Plus className="h-3.5 w-3.5" /> Add Maintenance
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Maintenance Record</DialogTitle>
          <DialogDescription>Record a vehicle service or repair.</DialogDescription>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Service Date *</Label>
              <Input type="date" value={form.serviceDate} onChange={e => set("serviceDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Service Type *</Label>
              <Select value={form.serviceType} onValueChange={v => set("serviceType", v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Cost (₹) *</Label>
              <Input type="number" step="0.01" placeholder="2500" value={form.cost} onChange={e => set("cost", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Odometer (km)</Label>
              <Input type="number" placeholder="45000" value={form.odometerReading} onChange={e => set("odometerReading", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Workshop</Label>
              <Input placeholder="Sharma Auto" value={form.workshopName} onChange={e => set("workshopName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Invoice No.</Label>
              <Input placeholder="INV-001" value={form.invoiceNumber} onChange={e => set("invoiceNumber", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Description</Label>
            <Textarea placeholder="Details of the service..." value={form.description} onChange={e => set("description", e.target.value)} rows={2} />
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
