import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { resolveDriverContext, getDriverAdvances, createDriverAdvanceRequest } from "@/lib/db/driver-service";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const driver = await resolveDriverContext(session.id, session.driverId);
    const data = await getDriverAdvances(driver.id);
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error("Get Driver Advances error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch advances" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const driver = await resolveDriverContext(session.id, session.driverId);
    const body = await request.json();
    const { tripId, amount, notes } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: "A valid advance amount is required" }, { status: 400 });
    }

    const result = await createDriverAdvanceRequest(driver.id, {
      tripId,
      amount: Number(amount),
      notes,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Driver Advance request error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to submit advance request" }, { status: 500 });
  }
}
