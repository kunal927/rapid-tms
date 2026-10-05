import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { getActiveDpds } from "@/lib/db/operations-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, User, Package } from "lucide-react";

export default async function OperationsDpdsPage() {
  await requireAuth(["OPERATIONS_MANAGER", "SUPER_ADMIN"]);
  const dpds = await getActiveDpds();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">DPD Delivery Hub Centers</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Assigned Distribution Points & Hub terminals for daily delivery route dispatches
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dpds.map((dpd: any) => (
          <Card key={dpd.id} className="shadow-2xs">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  <span className="font-bold text-sm text-foreground">{dpd.name}</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold">
                  {dpd.code}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 text-muted-foreground" /> {dpd.city}
              </p>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2 text-xs border-t mt-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Contact Person:
                </span>
                <span className="font-medium text-foreground">{dpd.contactPerson ?? "Hub Manager"}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Contact Phone:
                </span>
                <span className="font-medium text-foreground">{dpd.contactPhone ?? "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground pt-1 border-t">
                <span>Standard Delivery Cluster:</span>
                <Badge variant="secondary" className="text-[10px]">Active Destination</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
