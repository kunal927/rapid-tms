"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SettingsField {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "email" | "number";
}

interface SettingsFormProps {
  group: string;
  fields: SettingsField[];
  currentValues: Record<string, string>;
  dbLive: boolean;
}

export function SettingsForm({ group, fields, currentValues, dbLive }: SettingsFormProps) {
  const [values, setValues] = useState<Record<string, string>>(
    fields.reduce((acc, f) => {
      acc[f.key] = currentValues[f.key] ?? "";
      return acc;
    }, {} as Record<string, string>)
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!dbLive) {
      toast.error("Database is offline. Cannot save settings.");
      return;
    }
    setLoading(true);
    try {
      await Promise.all(
        fields.map(f =>
          fetch("/api/admin/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: f.key, value: values[f.key] ?? "", group }),
          })
        )
      );
      toast.success("Settings saved successfully");
      router.refresh();
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(field => (
          <div key={field.key} className="space-y-1.5">
            <Label className="text-xs font-semibold">{field.label}</Label>
            <Input
              type={field.type}
              placeholder={field.placeholder}
              value={values[field.key] ?? ""}
              onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
              disabled={!dbLive}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading || !dbLive} size="sm">
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
