"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Phone,
  MapPin,
  Shield,
  CreditCard,
  Calendar,
  Save,
  Loader2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileFormProps {
  driver: {
    id: string;
    driverCode: string;
    name: string;
    email: string;
    phone: string;
    licenseNumber: string;
    licenseExpiry: Date | null;
    emergencyContact: string;
    currentAddress: string;
    permanentAddress: string;
    perOrderRate: number;
    dateOfJoining: Date;
    status: string;
  };
}

export function ProfileForm({ driver }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [phone, setPhone] = useState(driver.phone || "");
  const [currentAddress, setCurrentAddress] = useState(driver.currentAddress || "");
  const [emergencyContact, setEmergencyContact] = useState(driver.emergencyContact || "");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/driver/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          currentAddress,
          emergencyContact,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile Updated Successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile changes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Non-editable Master Information Card */}
      <Card className="shadow-2xs">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-primary" /> Verified Master Records
            </span>
            <Badge variant="outline" className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Owner Controlled
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground block">Driver Code</span>
            <span className="font-bold text-foreground">{driver.driverCode}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground block">Driving License No.</span>
            <span className="font-bold text-foreground font-mono">{driver.licenseNumber}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground block">License Expiry</span>
            <span className="font-semibold text-foreground">
              {driver.licenseExpiry
                ? new Date(driver.licenseExpiry).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Active"}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground block">Per-Order Payout Rate</span>
            <span className="font-bold text-emerald-600">₹{driver.perOrderRate.toFixed(2)} / delivery</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground block">Date of Joining</span>
            <span className="font-medium text-foreground">
              {new Date(driver.dateOfJoining).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground block">Fleet Status</span>
            <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
              {driver.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Editable Contact & Address Form */}
      <Card className="shadow-2xs">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-primary" /> Contact & Residence Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSave} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Mobile Number
              </Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Emergency Contact Number
              </Label>
              <Input
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="+91 98111 22334 (Spouse / Family)"
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Current Residential Address
              </Label>
              <Textarea
                value={currentAddress}
                onChange={(e) => setCurrentAddress(e.target.value)}
                placeholder="Enter current local residential address"
                rows={2}
                className="text-xs"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-xs rounded-xl touch-manipulation shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Profile Details
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
