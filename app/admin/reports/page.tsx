import { requireAuth } from "@/lib/auth/session";
import { isDatabaseLive } from "@/lib/db/service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, FileSpreadsheet, Download, Truck, Users, Package,
  CreditCard, DollarSign, Receipt, Clock, Fuel, Wrench, Building2
} from "lucide-react";
import { ReportViewer } from "@/components/admin/report-viewer";

const REPORTS = [
  { id: "daily-trips", label: "Daily Trip Report", icon: Truck, description: "All trips for the selected date range" },
  { id: "driver-performance", label: "Driver Performance", icon: Users, description: "Driver-wise trip, delivery and earning stats" },
  { id: "vehicle-performance", label: "Vehicle Performance", icon: Truck, description: "Vehicle utilization and trip history" },
  { id: "delivery-report", label: "Delivery Report", icon: Package, description: "Order delivery success rates and status breakdown" },
  { id: "driver-payment", label: "Driver Payment Report", icon: CreditCard, description: "Payment calculations for all drivers" },
  { id: "advance-report", label: "Advance Report", icon: DollarSign, description: "All advance requests and their statuses" },
  { id: "expense-report", label: "Expense Report", icon: Receipt, description: "Driver and vehicle expense breakdown" },
  { id: "dpd-report", label: "DPD Report", icon: Building2, description: "DPD-wise trip and order summary" },
  { id: "fuel-report", label: "Fuel Report", icon: Fuel, description: "Fuel consumption and cost analysis" },
  { id: "maintenance-report", label: "Maintenance Report", icon: Wrench, description: "Vehicle maintenance history and costs" },
  { id: "attendance-report", label: "Attendance Report", icon: Clock, description: "Driver attendance summary and analysis" },
];

export default async function ReportsPage() {
  await requireAuth(["SUPER_ADMIN"]);
  const dbLive = await isDatabaseLive();

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">Generate comprehensive business intelligence reports</p>
        </div>
      </div>

      {!dbLive && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-800 dark:text-amber-300">
          <strong>Database Offline:</strong> Reports require a live database connection.
        </div>
      )}

      {/* Report cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map(report => (
          <Card key={report.id} className="hover:shadow-md transition-shadow group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <report.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{report.label}</CardTitle>
                  </div>
                </div>
              </div>
              <CardDescription className="text-xs mt-1">{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ReportViewer reportId={report.id} reportLabel={report.label} dbLive={dbLive} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
