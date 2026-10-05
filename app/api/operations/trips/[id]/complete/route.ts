import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { completeTripWorkflow } from "@/lib/db/operations-service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "OPERATIONS_MANAGER" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const remarks = body.remarks;
    const completed = await completeTripWorkflow(id, remarks, session.id);
    return NextResponse.json(completed);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
