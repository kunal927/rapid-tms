import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { resolveDriverContext, getDriverVehicle } from "@/lib/db/driver-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, ShieldCheck, Fuel, Gauge, AlertTriangle, Calendar, Lock } from "lucide-react";

export default async function DriverVehiclePage() {
  const session = await requireAuth(["DRIVER", "SUPER_ADMIN", "OPERATIONS_MANAGER"]);
  const driverContext = await resolveDriverContext(session.id, session.driverId);
  const vehicle = await getDriverVehicle(driverContext.id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          Assigned Vehicle
        </h1>
        <p className="text-xs text-muted-foreground">
          Fleet vehicle specifications, document compliance and alerts
        </p>
      </div>

      {/* Vehicle Specification Card */}
      <Card className="shadow-2xs rounded-2xl overflow-hidden border-primary/20">
        <div className="bg-primary/10 p-4 border-b flex items-start justify-between">
          <div>
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
              Fleet Registration
            </span>
            <h2 className="text-xl font-black text-foreground font-mono">
              {vehicle.vehicleNumber}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </p>
          </div>

          <Badge
            className={`text-xs font-bold px-2 py-0.5 ${
              vehicle.status === "ON_TRIP"
                ? "bg-emerald-600 text-white"
                : vehicle.status === "AVAILABLE"
                ? "bg-blue-600 text-white"
                : "bg-amber-600 text-white"
            }`}
          >
            {vehicle.status}
          </Badge>
        </div>

        <CardContent className="p-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-muted/30 p-2.5 rounded-xl border">
              <span className="text-[10px] text-muted-foreground block flex items-center justify-center gap-1">
                <Gauge className="w-3 h-3" /> Odometer
              </span>
              <span className="font-bold text-foreground mt-0.5 block font-mono">
                {vehicle.currentKm.toLocaleString()} KM
              </span>
            </div>

            <div className="bg-muted/30 p-2.5 rounded-xl border">
              <span className="text-[10px] text-muted-foreground block flex items-center justify-center gap-1">
                <Fuel className="w-3 h-3" /> Fuel Type
              </span>
              <span className="font-bold text-foreground mt-0.5 block">
                {vehicle.fuelType}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-muted/30 p-2.5 rounded-xl border">
              <span className="text-[10px] text-muted-foreground block">Payload Capacity</span>
              <span className="font-bold text-foreground mt-0.5 block">
                {vehicle.capacityTons} Metric Tons
              </span>
            </div>

            <div className="bg-muted/30 p-2.5 rounded-xl border">
              <span className="text-[10px] text-muted-foreground block">Vehicle Class</span>
              <span className="font-bold text-foreground mt-0.5 block">
                {vehicle.vehicleType}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance & Document Validity Alerts */}
      <Card className="shadow-2xs rounded-2xl overflow-hidden">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Statutory Document Validity
            </span>
            <span className="text-[10px] font-normal text-muted-foreground flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Fleet Master Locked
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between bg-muted/20 p-2.5 rounded-xl border">
            <div>
              <span className="font-semibold text-foreground block">Commercial Insurance</span>
              <span className="text-[10px] text-muted-foreground">Comprehensive coverage</span>
            </div>
            <span className="font-medium text-emerald-600">
              Valid till {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Active"}
            </span>
          </div>

          <div className="flex items-center justify-between bg-muted/20 p-2.5 rounded-xl border">
            <div>
              <span className="font-semibold text-foreground block">Fitness Certificate</span>
              <span className="text-[10px] text-muted-foreground">RTO Fitness passing</span>
            </div>
            <span className="font-medium text-emerald-600">
              Valid till {vehicle.fitnessExpiry ? new Date(vehicle.fitnessExpiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Active"}
            </span>
          </div>

          <div className="flex items-center justify-between bg-muted/20 p-2.5 rounded-xl border">
            <div>
              <span className="font-semibold text-foreground block">Pollution (PUC)</span>
              <span className="text-[10px] text-muted-foreground">Emission norm standard</span>
            </div>
            <span className="font-medium text-emerald-600">
              Valid till {vehicle.pollutionExpiry ? new Date(vehicle.pollutionExpiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Active"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
