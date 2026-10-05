"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, User, Truck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AddDriverDialogProps { trigger?: React.ReactNode }

export function AddDriverDialog({ trigger }: AddDriverDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    driverCode: "", licenseNumber: "", licenseExpiry: "",
    aadharNumber: "", panNumber: "", emergencyContact: "",
    dateOfJoining: new Date().toISOString().split("T")[0],
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.driverCode.trim() || !form.licenseNumber.trim()) {
      toast.error("Name, email, driver code and license are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          perOrderRate: 35,
          licenseExpiry: form.licenseExpiry || undefined,
          dateOfJoining: form.dateOfJoining || undefined,
        }),
      });
      if (res.ok) {
        toast.success(`Driver ${form.name} added successfully`);
        setOpen(false);
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.message ?? "Failed to add driver");
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
            <Plus className="h-4 w-4" /> Add Driver
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
              <DialogTitle className="text-lg font-bold">Add New Driver Profile</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Create a new driver account and save official compliance details.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Section 1: User Account & Credentials */}
            <div className="p-4 rounded-xl border bg-muted/20 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <User className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  1. Login & Contact Account
                </h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Full Name *</Label>
                  <Input
                    placeholder="e.g. Rajesh Kumar"
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    required
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="rajesh@email.com"
                    value={form.email}
                    onChange={e => set("email", e.target.value)}
                    required
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Phone Number</Label>
                  <Input
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    className="bg-background text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Account Password *</Label>
                  <Input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={e => set("password", e.target.value)}
                    required
                    className="bg-background text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Driver & Official Details */}
            <div className="p-4 rounded-xl border bg-muted/20 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  2. Driver & Official Details
                </h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Driver Code *</Label>
                    <Input
                      placeholder="DRV-001"
                      value={form.driverCode}
                      onChange={e => set("driverCode", e.target.value.toUpperCase())}
                      required
                      className="bg-background text-xs font-mono uppercase font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Date of Joining</Label>
                    <Input
                      type="date"
                      value={form.dateOfJoining}
                      onChange={e => set("dateOfJoining", e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">License No. *</Label>
                    <Input
                      placeholder="DL-XXXX-XXXXXXXX"
                      value={form.licenseNumber}
                      onChange={e => set("licenseNumber", e.target.value.toUpperCase())}
                      required
                      className="bg-background text-xs font-mono uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">License Expiry</Label>
                    <Input
                      type="date"
                      value={form.licenseExpiry}
                      onChange={e => set("licenseExpiry", e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Aadhar No.</Label>
                    <Input
                      placeholder="XXXX XXXX XXXX"
                      value={form.aadharNumber}
                      onChange={e => set("aadharNumber", e.target.value)}
                      className="bg-background text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Emergency Contact</Label>
                    <Input
                      placeholder="Emergency phone"
                      value={form.emergencyContact}
                      onChange={e => set("emergencyContact", e.target.value)}
                      className="bg-background text-xs font-mono"
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
              {loading ? "Adding Driver..." : "Save Driver Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
