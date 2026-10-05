import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { updateTrip } from "@/lib/db/admin-service";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = { ...body };

    // Auto-set timestamps based on status
    if (body.status === "STARTED" && !body.startTime) {
      updateData.startTime = new Date();
    }
    if (body.status === "COMPLETED" && !body.endTime) {
      updateData.endTime = new Date();
    }

    const trip = await updateTrip(id, updateData);
    return NextResponse.json(trip);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
