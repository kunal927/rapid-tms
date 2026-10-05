import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const orderStatusUpdateSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  status: z.enum([
    "PENDING",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "FAILED",
    "RESCHEDULED",
    "CANCELLED",
  ]),
  remarks: z.string().optional(),
});

export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
