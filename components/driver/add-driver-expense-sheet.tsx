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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Receipt, Camera, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddDriverExpenseSheetProps {
  currentTripId?: string;
  triggerButton?: React.ReactNode;
}

const CATEGORIES = [
  { value: "TOLL", label: "Toll Gate / FASTag" },
  { value: "FUEL", label: "Diesel / Fuel Top-Up" },
  { value: "PARKING", label: "Commercial Parking Bay" },
  { value: "FOOD", label: "Driver Meal / Food Allowance" },
  { value: "REPAIR", label: "Puncture / Quick Repair" },
  { value: "LOADING_UNLOADING", label: "Loading / Unloading Labour" },
  { value: "MISCELLANEOUS", label: "Miscellaneous En-Route Expense" },
];

export function AddDriverExpenseSheet({
  currentTripId,
  triggerButton,
}: AddDriverExpenseSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState("TOLL");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/driver/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: currentTripId,
          category,
          amount: Number(amount),
          notes,
          receiptUrl: receiptPreview,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit expense");
      }

      toast.success("Expense Submitted for Approval", {
        description: `₹${Number(amount).toFixed(2)} logged for ${category}. Transport manager will review.`,
      });

      setOpen(false);
      setAmount("");
      setNotes("");
      setReceiptPreview(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to log expense");
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
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 px-4 text-xs rounded-xl touch-manipulation shadow-xs flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Log Expense
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <SheetHeader className="text-left pb-2 border-b">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-base">
            <Receipt className="h-5 w-5" />
            <SheetTitle className="text-base font-bold text-foreground">
              Log En-Route Trip Expense
            </SheetTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Submit toll, parking, fuel or repair bills. Upload receipt photo for instant reimbursement verification.
          </p>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Expense Category</Label>
            <Select value={category} onValueChange={(val) => val && setCategory(val)}>
              <SelectTrigger className="h-11 text-xs">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-xs">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-sm font-bold text-muted-foreground">₹</span>
              <Input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 150.00"
                required
                className="pl-8 h-11 text-base font-bold"
              />
            </div>
          </div>

          {/* Receipt Photo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span>Receipt / Bill Photo Proof</span>
              <span className="text-[10px] text-muted-foreground">Camera / Upload</span>
            </Label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="h-11 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-xs font-medium bg-muted/20 hover:bg-muted/40 transition-colors">
                  <Camera className="w-4 h-4 text-amber-600" />
                  <span>{receiptPreview ? "Change Bill Photo" : "Upload Receipt Photo"}</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleReceiptUpload}
                />
              </label>
              {receiptPreview && (
                <img
                  src={receiptPreview}
                  alt="Receipt"
                  className="h-11 w-11 rounded-lg object-cover border"
                />
              )}
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Description / Plaza Name</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Kherki Daula FASTag plaza receipt"
              rows={2}
              className="text-xs"
            />
          </div>

          <SheetFooter className="pt-2">
            <Button
              type="submit"
              disabled={loading || !amount}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-12 text-sm rounded-xl touch-manipulation shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4" /> Submit Expense for Approval
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
