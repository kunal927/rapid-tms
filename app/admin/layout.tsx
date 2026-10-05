import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { isDatabaseLive } from "@/lib/db/service";
import { AppHeader } from "@/components/shared/app-header";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { DatabaseStatusBanner } from "@/components/shared/database-status-banner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth(["SUPER_ADMIN"]);
  const dbLive = await isDatabaseLive();

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar role="SUPER_ADMIN" />
      <SidebarInset className="flex flex-col flex-1 min-w-0 bg-background">
        <DatabaseStatusBanner isLive={dbLive} />
        <AppHeader user={session} panelTitle="Super Admin / Owner Command Center" />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
