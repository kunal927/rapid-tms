"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { XCircle, Camera, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface FailedOrderModalProps {
  orderId: string;
  orderNumber: string;
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
}

const FAILURE_REASONS = [
  "Customer unavailable / phone unreachable",
  "Premises locked / no one home",
  "Wrong address / address not found",
  "Customer refused consignment",
  "Customer requested delivery tomorrow",
  "COD amount not ready",
  "Vehicle breakdown / route blockage",
  "Other exception",
];

export function FailedOrderModal({
  orderId,
  orderNumber,
  onSuccess,
  triggerButton,
}: FailedOrderModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState(FAILURE_REASONS[0]);
  const [remarks, setRemarks] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReportFailed = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/driver/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "FAILED",
          failureReason: reason,
          remarks: remarks.trim() || reason,
          photoUrl: photoPreview,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to mark order as failed");
      }

      toast.warning(`Order ${orderNumber} Marked as Failed`, {
        description: `Reason: ${reason}`,
      });

      setOpen(false);
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to record failed delivery");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            size="sm"
            variant="outline"
            className="w-full border-rose-500/30 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/20 font-semibold h-11 text-xs rounded-xl touch-manipulation flex items-center justify-center gap-2"
          >
            <XCircle className="h-4 w-4" /> Mark Failed
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md w-full p-4 sm:p-6 rounded-2xl">
        <DialogHeader className="text-left pb-2 border-b">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle className="text-base font-bold text-foreground">
              Report Failed Delivery - {orderNumber}
            </DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Select the specific reason for non-delivery. This logs an exception for the operations team.
          </p>
        </DialogHeader>

        <form onSubmit={handleReportFailed} className="space-y-4 pt-2">
          {/* Reason */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Primary Non-Delivery Reason</Label>
            <Select value={reason} onValueChange={(val) => val && setReason(val)}>
              <SelectTrigger className="h-10 text-xs">
                <SelectValue placeholder="Select failure reason" />
              </SelectTrigger>
              <SelectContent>
                {FAILURE_REASONS.map((r) => (
                  <SelectItem key={r} value={r} className="text-xs">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Driver Remarks & Field Notes</Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Called customer 3 times, phone switched off. Gate closed."
              rows={3}
              required
              className="text-xs"
            />
          </div>

          {/* Optional Proof Photo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span>Gate / Doorstep Photo (Optional Proof)</span>
              <span className="text-[10px] text-muted-foreground">Camera / Upload</span>
            </Label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="h-10 border rounded-xl flex items-center justify-center gap-2 text-xs font-medium bg-muted/30 hover:bg-muted transition-colors">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                  <span>{photoPreview ? "Change Photo" : "Take Photo of Locked Gate"}</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Failed Proof"
                  className="h-10 w-10 rounded-lg object-cover border"
                />
              )}
            </div>
          </div>

          <DialogFooter className="pt-2 sm:pt-4">
            <Button
              type="submit"
              disabled={loading || !remarks.trim()}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-12 text-sm rounded-xl touch-manipulation shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Recording Exception...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" /> Submit Non-Delivery Report
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
