import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { isDatabaseLive } from "@/lib/db/service";
import { resolveDriverContext } from "@/lib/db/driver-service";
import { DriverHeader } from "@/components/shared/driver-header";
import { DriverMobileBar } from "@/components/shared/driver-mobile-bar";
import { DatabaseStatusBanner } from "@/components/shared/database-status-banner";

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth(["DRIVER", "SUPER_ADMIN", "OPERATIONS_MANAGER"]);
  const dbLive = await isDatabaseLive();
  const driverContext = await resolveDriverContext(session.id, session.driverId);

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20 md:pb-6">
      <DatabaseStatusBanner isLive={dbLive} />
      <DriverHeader
        user={session}
        driverName={driverContext.user.name}
        driverCode={driverContext.driverCode}
      />
      <main className="flex-1 p-3 sm:p-5 max-w-xl mx-auto w-full">
        {children}
      </main>
      <DriverMobileBar />
    </div>
  );
}
