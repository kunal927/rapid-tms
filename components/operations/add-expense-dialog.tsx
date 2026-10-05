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
import { Receipt, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const OPERATIONAL_CATEGORIES = [
  "TOLL",
  "PARKING",
  "LOADING",
  "UNLOADING",
  "MISCELLANEOUS",
];

interface AddExpenseDialogProps {
  trips: { id: string; tripNumber: string; vehicleNumber: string; driverName: string }[];
  defaultTripId?: string;
  trigger?: React.ReactNode;
}

export function AddExpenseDialog({ trips, defaultTripId, trigger }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    tripId: defaultTripId ?? (trips[0]?.id ?? ""),
    category: "TOLL",
    amount: "",
    notes: "",
  });

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/operations/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Failed to submit expense");
      }

      toast.success("Operational expense logged for Owner approval!");
      setOpen(false);
      setForm({
        tripId: defaultTripId ?? (trips[0]?.id ?? ""),
        category: "TOLL",
        amount: "",
        notes: "",
      });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Error submitting expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Log Operational Expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-amber-600" />
            Log Operational Expense
          </DialogTitle>
          <DialogDescription>
            Submit an on-route expense for Toll, Parking, Loading or Unloading.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Associated Trip *</Label>
            <Select value={form.tripId} onValueChange={v => set("tripId", v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select trip" />
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category *</Label>
              <Select value={form.category} onValueChange={v => set("category", v ?? "TOLL")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATIONAL_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Amount (₹) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="250"
                value={form.amount}
                onChange={e => set("amount", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Remarks / Location</Label>
            <Textarea
              placeholder="e.g. NH-48 Toll plaza receipt, MCD parking slip..."
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              rows={2}
            />
          </div>

          <p className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
            This expense will be routed to the Owner / Super Admin approval queue for reimbursement settlement.
          </p>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-1.5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Submit Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
