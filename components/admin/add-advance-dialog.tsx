"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Driver { id: string; driverCode: string; user: { name: string } }

export function AddAdvanceDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const router = useRouter();

  const [form, setForm] = useState({
    driverId: "", amount: "", paymentMode: "CASH", notes: "",
  });

  useEffect(() => {
    if (open) {
      fetch("/api/admin/drivers?limit=100")
        .then(r => r.json())
        .then(d => setDrivers(d.drivers ?? []))
        .catch(() => {});
    }
  }, [open]);

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.driverId || !form.amount) {
      toast.error("Driver and amount are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/advances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      if (res.ok) {
        toast.success("Advance disbursed successfully");
        setOpen(false);
        setForm({ driverId: "", amount: "", paymentMode: "CASH", notes: "" });
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.message ?? "Failed to disburse advance");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5 font-medium shadow-sm">
            <Plus className="h-3.5 w-3.5" /> Give Advance
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Give Driver Advance</DialogTitle>
          <DialogDescription>Disburse direct cash, UPI or transit advance to driver (recorded immediately).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Driver *</Label>
            <Select value={form.driverId} onValueChange={v => set("driverId", v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
              <SelectContent>
                {drivers.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.user.name} ({d.driverCode})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Amount (₹) *</Label>
              <Input type="number" step="0.01" min="1" placeholder="500" value={form.amount} onChange={e => set("amount", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Payment Mode</Label>
              <Select value={form.paymentMode} onValueChange={v => set("paymentMode", v ?? "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Reason / Notes</Label>
            <Textarea placeholder="Reason or trip reference for advance..." value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Disbursing..." : "Disburse Advance"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
