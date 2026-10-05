import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
  };
  accentColor?: "blue" | "emerald" | "amber" | "purple" | "rose";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "blue",
}: StatCardProps) {
  const accentClasses = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  }[accentColor];

  return (
    <Card className="border shadow-xs hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <div className={`p-2.5 rounded-lg ${accentClasses}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </h3>
          {(subtitle || trend) && (
            <div className="flex items-center gap-2 mt-1">
              {trend && (
                <span
                  className={`text-xs font-semibold ${
                    trend.positive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {trend.value}
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-muted-foreground">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
