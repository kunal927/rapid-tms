"use client";

import { useMemo } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

const PERIODS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Last Month", value: "lastmonth" },
];

export function DashboardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedMonth = searchParams.get("month") ?? "";
  const period = searchParams.get("period") ?? (selectedMonth ? "month_select" : "today");

  // Dynamically generate past 24 months starting from current month going backwards
  const pastMonths = useMemo(() => {
    const list: { label: string; value: string }[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    for (let i = 0; i < 24; i++) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, "0");
      const val = `${year}-${monthNum}`;
      const monthName = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

      list.push({
        label: i === 0 ? `${monthName} (Current)` : monthName,
        value: val,
      });
    }
    return list;
  }, []);

  const handlePeriod = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", value);
    params.delete("month");
    router.replace(`?${params.toString()}`);
  };

  const handleMonthSelect = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", "month_select");
    params.set("month", val);
    router.replace(`?${params.toString()}`);
  };

  const activeMonthLabel = pastMonths.find((m) => m.value === selectedMonth)?.label;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground font-semibold">Filter by:</span>

      {/* Quick Period Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {PERIODS.map((p) => {
          const isActive = !selectedMonth && period === p.value;
          return (
            <button
              key={p.value}
              onClick={() => handlePeriod(p.value)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                  : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="h-4 w-[1px] bg-border/80 hidden sm:block mx-0.5" />

      {/* Past Month Selection Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={selectedMonth ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs font-semibold gap-1.5 rounded-full px-3 transition-all"
          >
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{activeMonthLabel ? activeMonthLabel : "Select Past Month"}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 max-h-64 overflow-y-auto">
          <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
            Select Past Month
          </div>
          {pastMonths.map((m) => (
            <DropdownMenuItem
              key={m.value}
              onClick={() => handleMonthSelect(m.value)}
              className={`text-xs font-medium cursor-pointer ${
                selectedMonth === m.value ? "bg-primary/10 text-primary font-bold" : ""
              }`}
            >
              {m.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
