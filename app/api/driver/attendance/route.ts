import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import {
  resolveDriverContext,
  driverCheckInWorkflow,
  driverCheckOutWorkflow,
} from "@/lib/db/driver-service";

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const driver = await resolveDriverContext(session.id, session.driverId);
    const body = await request.json();
    const { action, notes, latitude, longitude } = body;

    if (action === "CHECK_IN") {
      const result = await driverCheckInWorkflow(
        driver.id,
        notes,
        latitude ? Number(latitude) : undefined,
        longitude ? Number(longitude) : undefined
      );
      return NextResponse.json(result);
    } else if (action === "CHECK_OUT") {
      const result = await driverCheckOutWorkflow(driver.id, notes);
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ success: false, error: "Invalid attendance action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Driver Attendance error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update attendance" }, { status: 500 });
  }
}
