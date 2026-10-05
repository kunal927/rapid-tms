import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { resolveDriverContext, driverStartTripWorkflow } from "@/lib/db/driver-service";

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const driver = await resolveDriverContext(session.id, session.driverId);
    const body = await request.json();
    const { tripId, startKm, notes } = body;

    if (!tripId) {
      return NextResponse.json({ success: false, error: "Trip ID is required" }, { status: 400 });
    }

    const result = await driverStartTripWorkflow(driver.id, tripId, Number(startKm) || undefined, notes);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Driver Start Trip error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to start trip" }, { status: 500 });
  }
}
