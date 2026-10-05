import React from "react";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getVehicleProfileWithExpenses } from "@/lib/db/vehicle-expense-service";
import { VehicleProfileViewer } from "@/components/admin/vehicle-profile-viewer";

export default async function AdminVehicleProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth(["SUPER_ADMIN", "OPERATIONS_MANAGER"]);
  const { id } = await params;

  const data = await getVehicleProfileWithExpenses(id);

  if (!data || !data.vehicle) {
    notFound();
  }

  return (
    <VehicleProfileViewer
      vehicle={data.vehicle}
      analytics={data.analytics}
      monthlySummaries={data.monthlySummaries}
      maintenanceRecords={data.maintenanceRecords}
    />
  );
}
