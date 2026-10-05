import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { resolveDriverContext, updateDriverProfile } from "@/lib/db/driver-service";

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const driver = await resolveDriverContext(session.id, session.driverId);
    const body = await request.json();
    const { phone, currentAddress, emergencyContact, avatarUrl } = body;

    const result = await updateDriverProfile(driver.id, {
      phone,
      currentAddress,
      emergencyContact,
      avatarUrl,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Driver Profile update error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
