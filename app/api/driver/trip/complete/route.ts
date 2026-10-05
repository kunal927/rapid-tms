import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { resolveDriverContext, driverCompleteTripWorkflow } from "@/lib/db/driver-service";

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const driver = await resolveDriverContext(session.id, session.driverId);
    const body = await request.json();
    const { tripId, endKm, notes } = body;

    if (!tripId) {
      return NextResponse.json({ success: false, error: "Trip ID is required" }, { status: 400 });
    }

    const result = await driverCompleteTripWorkflow(driver.id, tripId, Number(endKm) || undefined, notes);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Driver Complete Trip error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to complete trip" }, { status: 500 });
  }
}
