import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { updateOrderStatus } from "@/lib/db/service";
import { orderStatusUpdateSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = orderStatusUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { orderId, status, remarks } = result.data;
    const success = await updateOrderStatus(
      orderId,
      status,
      remarks,
      session.name
    );

    if (!success) {
      return NextResponse.json(
        { error: "Order not found or update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error("Order status update API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
