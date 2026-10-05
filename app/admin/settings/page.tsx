import { requireAuth } from "@/lib/auth/session";
import { getSettings } from "@/lib/db/admin-service";
import { isDatabaseLive } from "@/lib/db/service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Building2, Truck, CreditCard, Bell, Database } from "lucide-react";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  await requireAuth(["SUPER_ADMIN"]);
  const dbLive = await isDatabaseLive();

  let settings: Awaited<ReturnType<typeof getSettings>> = [];
  if (dbLive) {
    try { settings = await getSettings(); } catch {}
  }

  // Convert settings array to key-value map
  const settingsMap = settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure system-wide settings and preferences</p>
      </div>

      {!dbLive && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-800 dark:text-amber-300">
          <strong>Database Offline:</strong> Settings require a database connection to persist.
        </div>
      )}

      <Tabs defaultValue="company">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company" className="text-xs gap-1.5"><Building2 className="h-3.5 w-3.5" />Company</TabsTrigger>
          <TabsTrigger value="trip" className="text-xs gap-1.5"><Truck className="h-3.5 w-3.5" />Trip</TabsTrigger>
          <TabsTrigger value="payment" className="text-xs gap-1.5"><CreditCard className="h-3.5 w-3.5" />Payment</TabsTrigger>
          <TabsTrigger value="notification" className="text-xs gap-1.5"><Bell className="h-3.5 w-3.5" />Alerts</TabsTrigger>
          <TabsTrigger value="system" className="text-xs gap-1.5"><Database className="h-3.5 w-3.5" />System</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Company Information</CardTitle>
              <CardDescription className="text-xs">Basic company details shown in reports and documents.</CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsForm
                group="COMPANY"
                dbLive={dbLive}
                fields={[
                  { key: "company_name", label: "Company Name", placeholder: "Rapone Logistics Pvt. Ltd.", type: "text" },
                  { key: "company_address", label: "Address", placeholder: "123, Main Street, Delhi", type: "text" },
                  { key: "company_phone", label: "Phone", placeholder: "+91 9876543210", type: "text" },
                  { key: "company_email", label: "Email", placeholder: "admin@rapone.com", type: "email" },
                  { key: "company_gst", label: "GST Number", placeholder: "22AAAAA0000A1Z5", type: "text" },
                  { key: "company_pan", label: "PAN Number", placeholder: "AAAAA0000A", type: "text" },
                ]}
                currentValues={settingsMap}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trip" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Trip Settings</CardTitle>
              <CardDescription className="text-xs">Configure trip numbering and default behaviors.</CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsForm
                group="TRIP"
                dbLive={dbLive}
                fields={[
                  { key: "trip_number_prefix", label: "Trip Number Prefix", placeholder: "TRP", type: "text" },
                  { key: "trip_auto_assign", label: "Auto-assign on Create", placeholder: "true", type: "text" },
                  { key: "trip_max_orders", label: "Max Orders per Trip", placeholder: "100", type: "number" },
                ]}
                currentValues={settingsMap}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payment Settings</CardTitle>
              <CardDescription className="text-xs">Default payment rates and rules.</CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsForm
                group="PAYMENT"
                dbLive={dbLive}
                fields={[
                  { key: "default_per_order_rate", label: "Default Rate per Order (₹)", placeholder: "35", type: "number" },
                  { key: "payment_cycle", label: "Payment Cycle", placeholder: "DAILY", type: "text" },
                  { key: "advance_limit_per_driver", label: "Max Advance per Driver (₹)", placeholder: "5000", type: "number" },
                ]}
                currentValues={settingsMap}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notification" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Notification Settings</CardTitle>
              <CardDescription className="text-xs">Configure alert thresholds and notification preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsForm
                group="NOTIFICATION"
                dbLive={dbLive}
                fields={[
                  { key: "doc_expiry_warning_days", label: "Document Expiry Warning (days)", placeholder: "30", type: "number" },
                  { key: "license_expiry_warning_days", label: "License Expiry Warning (days)", placeholder: "30", type: "number" },
                  { key: "notify_trip_completed", label: "Notify on Trip Complete", placeholder: "true", type: "text" },
                  { key: "notify_advance_requested", label: "Notify on Advance Request", placeholder: "true", type: "text" },
                ]}
                currentValues={settingsMap}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">System Settings</CardTitle>
              <CardDescription className="text-xs">Technical configuration and system preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted/30">
                  <p className="text-xs font-semibold mb-2">Database Status</p>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`h-2 w-2 rounded-full ${dbLive ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span>{dbLive ? "Connected — MySQL is live" : "Disconnected — Check DATABASE_URL"}</span>
                  </div>
                </div>
                <div className="rounded-lg border p-4 bg-muted/30">
                  <p className="text-xs font-semibold mb-2">Version</p>
                  <p className="text-xs text-muted-foreground">TMS v1.0.0 — Transport Management System</p>
                </div>
                <SettingsForm
                  group="SYSTEM"
                  dbLive={dbLive}
                  fields={[
                    { key: "timezone", label: "Timezone", placeholder: "Asia/Kolkata", type: "text" },
                    { key: "date_format", label: "Date Format", placeholder: "DD/MM/YYYY", type: "text" },
                    { key: "currency_symbol", label: "Currency Symbol", placeholder: "₹", type: "text" },
                  ]}
                  currentValues={settingsMap}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
