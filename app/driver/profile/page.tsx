import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { resolveDriverContext, getDriverProfile } from "@/lib/db/driver-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/driver/profile-form";
import { Truck } from "lucide-react";

export default async function DriverProfilePage() {
  const session = await requireAuth(["DRIVER", "SUPER_ADMIN", "OPERATIONS_MANAGER"]);
  const driverContext = await resolveDriverContext(session.id, session.driverId);
  const driver = await getDriverProfile(driverContext.id);

  return (
    <div className="space-y-4">
      {/* Profile Header Avatar Banner */}
      <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 flex items-center gap-3.5 shadow-2xs">
        <Avatar className="h-14 w-14 border-2 border-primary/20">
          {driver.avatarUrl && <AvatarImage src={driver.avatarUrl} alt={driver.name} />}
          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-base">
            {driver.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-foreground">
            {driver.name}
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            {driver.driverCode} &bull; {driver.email}
          </p>
          <Badge className="bg-emerald-600 text-white text-[10px] font-semibold mt-1">
            <Truck className="w-2.5 h-2.5 mr-1" /> Verified Fleet Driver
          </Badge>
        </div>
      </div>

      {/* Profile Form */}
      <ProfileForm driver={driver} />
    </div>
  );
}
