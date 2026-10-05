"use client";

import React, { useState, useRef, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Camera,
  PenTool,
  RotateCcw,
  MapPin,
  Lock,
  User,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface DeliverOrderModalProps {
  orderId: string;
  orderNumber: string;
  defaultRecipientName: string;
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
}

export function DeliverOrderModal({
  orderId,
  orderNumber,
  defaultRecipientName,
  onSuccess,
  triggerButton,
}: DeliverOrderModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [recipientName, setRecipientName] = useState(defaultRecipientName);
  const [otp, setOtp] = useState("");
  const [remarks, setRemarks] = useState("Handed over to customer at doorstep");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Auto-detect GPS on open (non-blocking)
  useEffect(() => {
    if (open && typeof window !== "undefined" && "geolocation" in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocating(false);
        },
        () => {
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, [open]);

  // Touch signature drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#10b981";
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Photo capture handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDeliver = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const signatureDataUrl = canvasRef.current?.toDataURL("image/png");

      const res = await fetch(`/api/driver/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DELIVERED",
          recipientName,
          otp,
          signatureUrl: hasSignature ? signatureDataUrl : null,
          photoUrl: photoPreview,
          remarks,
          latitude: location?.lat,
          longitude: location?.lng,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to confirm delivery");
      }

      toast.success(`Order ${orderNumber} Delivered Successfully!`, {
        description: "POD recorded & trip delivery count updated.",
      });

      setOpen(false);
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
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
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-sm rounded-xl touch-manipulation shadow-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" /> Mark Delivered
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md w-full p-4 sm:p-6 max-h-[92vh] overflow-y-auto rounded-2xl">
        <DialogHeader className="text-left pb-2 border-b">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
            <CheckCircle2 className="h-5 w-5" />
            <DialogTitle className="text-base font-bold text-foreground">
              Confirm Delivery - {orderNumber}
            </DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Complete doorstep proof of delivery with signature and recipient verification.
          </p>
        </DialogHeader>

        <form onSubmit={handleDeliver} className="space-y-4 pt-2">
          {/* Recipient Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" /> Received By (Customer Name)
            </Label>
            <Input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Ramesh Chandra"
              required
              className="h-10 text-sm"
            />
          </div>

          {/* OTP */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Delivery OTP (if enabled)
              </span>
              <span className="text-[10px] text-muted-foreground">Optional</span>
            </Label>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="4-digit OTP from customer SMS"
              maxLength={6}
              className="h-10 text-sm tracking-widest font-mono"
            />
          </div>

          {/* Signature Pad */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-muted-foreground" /> Customer Signature (Draw on screen)
              </Label>
              {hasSignature && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-[11px] text-rose-500 hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            <div className="border-2 border-dashed rounded-xl bg-muted/20 relative overflow-hidden touch-none">
              <canvas
                ref={canvasRef}
                width={340}
                height={120}
                className="w-full h-[120px] cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasSignature && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-muted-foreground/60">
                  Tap & draw customer signature here
                </div>
              )}
            </div>
          </div>

          {/* Delivery Photo Proof */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-muted-foreground" /> Parcel Photo / Doorstep Proof
              </span>
              <span className="text-[10px] text-muted-foreground">Camera / Gallery</span>
            </Label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="h-10 border rounded-xl flex items-center justify-center gap-2 text-xs font-medium bg-muted/30 hover:bg-muted transition-colors">
                  <Camera className="w-4 h-4 text-primary" />
                  <span>{photoPreview ? "Change Photo" : "Take Photo / Upload"}</span>
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
                  alt="POD"
                  className="h-10 w-10 rounded-lg object-cover border"
                />
              )}
            </div>
          </div>

          {/* GPS Coordinates */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/30 p-2.5 rounded-xl">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {locating
                  ? "Detecting location..."
                  : location
                  ? `GPS: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                  : "GPS location captured automatically"}
              </span>
            </div>
            {location && <span className="text-emerald-600 font-bold text-[10px]">Verified</span>}
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Remarks</Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Received at reception / front door"
              rows={2}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-2 sm:pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-sm rounded-xl touch-manipulation shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Recording Delivery...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Confirm & Complete Delivery
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
