import React from "react";
import { Badge } from "@/components/ui/badge";

export type TripStatusType =
  | "DRAFT"
  | "ASSIGNED"
  | "STARTED"
  | "RUNNING"
  | "COMPLETED"
  | "CANCELLED";

export type OrderStatusType =
  | "PENDING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "RESCHEDULED"
  | "CANCELLED";

interface StatusBadgeProps {
  status: TripStatusType | OrderStatusType | string;
  type?: "trip" | "order";
}

export function StatusBadge({ status, type = "trip" }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  // Color mapping based on logistics semantic states
  switch (normalized) {
    case "COMPLETED":
    case "DELIVERED":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25 font-medium px-2.5 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
          {normalized === "COMPLETED" ? "Completed" : "Delivered"}
        </Badge>
      );

    case "RUNNING":
    case "OUT_FOR_DELIVERY":
      return (
        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/25 font-medium px-2.5 py-0.5 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 inline-block" />
          {normalized === "RUNNING" ? "Running Live" : "Out For Delivery"}
        </Badge>
      );

    case "STARTED":
      return (
        <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/25 font-medium px-2.5 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-1.5 inline-block" />
          Started
        </Badge>
      );

    case "ASSIGNED":
    case "PENDING":
      return (
        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25 font-medium px-2.5 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 inline-block" />
          {normalized === "ASSIGNED" ? "Assigned" : "Pending"}
        </Badge>
      );

    case "FAILED":
    case "CANCELLED":
      return (
        <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/25 font-medium px-2.5 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 inline-block" />
          {normalized === "FAILED" ? "Failed / Attempted" : "Cancelled"}
        </Badge>
      );

    case "RESCHEDULED":
      return (
        <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/25 font-medium px-2.5 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5 inline-block" />
          Rescheduled
        </Badge>
      );

    case "DRAFT":
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground font-normal px-2.5 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 mr-1.5 inline-block" />
          {normalized}
        </Badge>
      );
  }
}
