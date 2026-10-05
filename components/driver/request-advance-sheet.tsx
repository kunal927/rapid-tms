"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RequestAdvanceSheetProps {
  currentTripId?: string;
  triggerButton?: React.ReactNode;
}

export function RequestAdvanceSheet({
  currentTripId,
  triggerButton,
}: RequestAdvanceSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/driver/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: currentTripId,
          amount: Number(amount),
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit request");
      }

      toast.success("Advance Request Submitted", {
        description: `₹${Number(amount).toFixed(2)} requested. Transport manager or owner will review.`,
      });

      setOpen(false);
      setAmount("");
      setNotes("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to request advance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {triggerButton || (
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-4 text-xs rounded-xl touch-manipulation shadow-xs flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Request Advance
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <SheetHeader className="text-left pb-2 border-b">
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <CreditCard className="h-5 w-5" />
            <SheetTitle className="text-base font-bold text-foreground">
              Request Route Advance
            </SheetTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Request an en-route fuel or operating cash advance. Approved amount is settled against trip earnings.
          </p>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Advance Amount Needed (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-sm font-bold text-muted-foreground">₹</span>
              <Input
                type="number"
                step="50"
                min="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1000"
                required
                className="pl-8 h-11 text-base font-bold"
              />
            </div>
            <div className="flex gap-2 pt-1">
              {[500, 1000, 1500, 2000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className="px-2.5 py-1 rounded-lg border text-[11px] font-semibold bg-muted/30 hover:bg-muted active:scale-95 transition-all"
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Reason / Expense Purpose</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Need diesel top-up and toll payments for long corridor trip"
              rows={3}
              required
              className="text-xs"
            />
          </div>

          <SheetFooter className="pt-2">
            <Button
              type="submit"
              disabled={loading || !amount}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 text-sm rounded-xl touch-manipulation shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting Request...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" /> Submit Advance Request
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
