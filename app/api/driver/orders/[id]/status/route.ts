import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { resolveDriverContext, driverUpdateDeliveryWorkflow } from "@/lib/db/driver-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = await params;
    const driver = await resolveDriverContext(session.id, session.driverId);
    const body = await request.json();

    const {
      status,
      recipientName,
      otp,
      signatureUrl,
      photoUrl,
      remarks,
      failureReason,
      rescheduleDate,
      latitude,
      longitude,
    } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: "Status is required" }, { status: 400 });
    }

    const result = await driverUpdateDeliveryWorkflow(driver.id, {
      orderId,
      status,
      recipientName,
      otp,
      signatureUrl,
      photoUrl,
      remarks,
      failureReason,
      rescheduleDate,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Driver Order Status error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update order status" }, { status: 500 });
  }
}
