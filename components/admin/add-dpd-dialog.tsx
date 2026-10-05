"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AddDpdDialogProps { trigger?: React.ReactNode }

export function AddDpdDialog({ trigger }: AddDpdDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    code: "", name: "", city: "", state: "", address: "",
    contactPerson: "", contactPhone: "", contactEmail: "",
    ratePerOrderDefault: "",
  });

  const handleChange = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim() || !form.city.trim()) {
      toast.error("Code, name and city are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dpds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ratePerOrderDefault: form.ratePerOrderDefault ? parseFloat(form.ratePerOrderDefault) : 0,
        }),
      });
      if (res.ok) {
        toast.success(`DPD "${form.name}" added successfully`);
        setOpen(false);
        setForm({ code: "", name: "", city: "", state: "", address: "", contactPerson: "", contactPhone: "", contactEmail: "", ratePerOrderDefault: "" });
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.message ?? "Failed to add DPD");
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
            <Plus className="h-3.5 w-3.5" /> Add DPD
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New DPD</DialogTitle>
          <DialogDescription>Enter DPD details to add it to the system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">DPD Code *</Label>
              <Input placeholder="DPD001" value={form.code} onChange={e => handleChange("code", e.target.value.toUpperCase())} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">DPD Name *</Label>
              <Input placeholder="Blue Dart Logistics" value={form.name} onChange={e => handleChange("name", e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">City *</Label>
              <Input placeholder="Delhi" value={form.city} onChange={e => handleChange("city", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">State</Label>
              <Input placeholder="Delhi" value={form.state} onChange={e => handleChange("state", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Address</Label>
            <Textarea placeholder="Full address..." value={form.address} onChange={e => handleChange("address", e.target.value)} rows={2} />
          </div>
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Contact Information</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Contact Person</Label>
                <Input placeholder="Rahul Sharma" value={form.contactPerson} onChange={e => handleChange("contactPerson", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone</Label>
                <Input placeholder="9876543210" value={form.contactPhone} onChange={e => handleChange("contactPhone", e.target.value)} />
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              <Label className="text-xs font-semibold">Email</Label>
              <Input type="email" placeholder="contact@dpd.com" value={form.contactEmail} onChange={e => handleChange("contactEmail", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Default Rate per Order (₹)</Label>
            <Input type="number" step="0.01" placeholder="35.00" value={form.ratePerOrderDefault} onChange={e => handleChange("ratePerOrderDefault", e.target.value)} />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add DPD"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
