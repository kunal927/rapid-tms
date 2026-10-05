import React from "react";
import { requireAuth } from "@/lib/auth/session";
import {
  getOperationsTripBoard,
  getEligibleDrivers,
  getEligibleVehicles,
  getActiveDpds,
} from "@/lib/db/operations-service";
import { TripBoard } from "@/components/operations/trip-board";
import { CreateTripDialog } from "@/components/operations/create-trip-dialog";

export default async function OperationsBoardPage() {
  await requireAuth(["OPERATIONS_MANAGER", "SUPER_ADMIN"]);

  const [trips, drivers, vehicles, dpds] = await Promise.all([
    getOperationsTripBoard(),
    getEligibleDrivers(),
    getEligibleVehicles(),
    getActiveDpds(),
  ]);

  const driverOptions = drivers.map((d: any) => ({ id: d.id, name: `${d.user?.name ?? ""} (${d.driverCode})` }));
  const vehicleOptions = vehicles.map((v: any) => ({ id: v.id, vehicleNumber: v.vehicleNumber }));
  const dpdOptions = dpds.map((d: any) => ({ id: d.id, name: `${d.name} (${d.city})` }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Today's Operations Board</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Visual kanban board for tracking active route stages from initial assignment to delivery completion
          </p>
        </div>

        <CreateTripDialog
          vehicles={vehicles}
          drivers={drivers}
          dpds={dpds}
        />
      </div>

      <TripBoard
        initialTrips={trips as any}
        drivers={driverOptions}
        vehicles={vehicleOptions}
        dpds={dpdOptions}
      />
    </div>
  );
}
