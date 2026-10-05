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
import { Plus, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AddOrderDialogProps {
  dpds: { id: string; name: string; city: string }[];
  trips: { id: string; tripNumber: string; vehicleNumber: string }[];
  defaultTripId?: string;
  trigger?: React.ReactNode;
}

export function AddOrderDialog({ dpds, trips, defaultTripId, trigger }: AddOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    orderNumber: "",
    tripId: defaultTripId ?? "",
    dpdId: dpds[0]?.id ?? "",
    recipientName: "",
    recipientPhone: "",
    deliveryAddress: "",
    city: "Delhi",
    pincode: "110001",
    packageDetails: "",
    codAmount: "0",
  });

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipientName || !form.recipientPhone || !form.deliveryAddress || !form.dpdId) {
      toast.error("Please fill in recipient name, phone, address, and DPD hub.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/operations/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to create order");

      toast.success(`Order ${data.orderNumber} added successfully!`);
      setOpen(false);
      setForm({
        orderNumber: "",
        tripId: defaultTripId ?? "",
        dpdId: dpds[0]?.id ?? "",
        recipientName: "",
        recipientPhone: "",
        deliveryAddress: "",
        city: "Delhi",
        pincode: "110001",
        packageDetails: "",
        codAmount: "0",
      });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Error creating order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Order
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Add Delivery Package / Order
          </DialogTitle>
          <DialogDescription>
            Register an individual delivery consignment into the system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Order / Tracking No.</Label>
              <Input
                placeholder="Auto-generated if empty"
                value={form.orderNumber}
                onChange={e => set("orderNumber", e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assign to Trip</Label>
              <Select value={form.tripId} onValueChange={v => set("tripId", v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned / Ready" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- None (Unassigned) --</SelectItem>
                  {trips.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.tripNumber} ({t.vehicleNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Origin DPD Hub *</Label>
            <Select value={form.dpdId} onValueChange={v => set("dpdId", v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select DPD" />
              </SelectTrigger>
              <SelectContent>
                {dpds.map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} ({d.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Customer Name *</Label>
              <Input
                placeholder="Rahul Kumar"
                value={form.recipientName}
                onChange={e => set("recipientName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Customer Phone *</Label>
              <Input
                placeholder="9876543210"
                value={form.recipientPhone}
                onChange={e => set("recipientPhone", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Delivery Address *</Label>
            <Textarea
              placeholder="Flat 101, Galaxy Heights, Sector 62..."
              value={form.deliveryAddress}
              onChange={e => set("deliveryAddress", e.target.value)}
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">City</Label>
              <Input
                value={form.city}
                onChange={e => set("city", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Pincode</Label>
              <Input
                value={form.pincode}
                onChange={e => set("pincode", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">COD Amount (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                value={form.codAmount}
                onChange={e => set("codAmount", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Package Details</Label>
            <Input
              placeholder="Electronics / Clothes / Fragile (Optional)"
              value={form.packageDetails}
              onChange={e => set("packageDetails", e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-1.5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
