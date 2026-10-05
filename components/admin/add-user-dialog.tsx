"use client";

import { useState } from "react";
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

export function AddUserDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", role: "OPERATIONS_MANAGER",
  });

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email and password are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(`User "${form.name}" created successfully`);
        setOpen(false);
        setForm({ name: "", email: "", phone: "", password: "", role: "OPERATIONS_MANAGER" });
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.message ?? "Failed to create user");
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
            <Plus className="h-3.5 w-3.5" /> Add User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create User Account</DialogTitle>
          <DialogDescription>Add a new user with appropriate role and permissions.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Full Name *</Label>
            <Input placeholder="Rahul Kumar" value={form.name} onChange={e => set("name", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Email *</Label>
            <Input type="email" placeholder="rahul@company.com" value={form.email} onChange={e => set("email", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Phone</Label>
            <Input placeholder="9876543210" value={form.phone} onChange={e => set("phone", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Role *</Label>
            <Select value={form.role} onValueChange={v => set("role", v ?? "")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPER_ADMIN">Super Admin / Owner</SelectItem>
                <SelectItem value="OPERATIONS_MANAGER">Operations Manager</SelectItem>
                <SelectItem value="DRIVER">Driver</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Initial Password *</Label>
            <Input type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => set("password", e.target.value)} required minLength={8} />
            <p className="text-[10px] text-muted-foreground">User should change this after first login.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create User"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
