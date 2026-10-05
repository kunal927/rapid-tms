import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { updateDpd } from "@/lib/db/admin-service";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const dpd = await updateDpd(id, body);
    return NextResponse.json(dpd);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
