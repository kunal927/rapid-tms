import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { updateExpenseStatus } from "@/lib/db/admin-service";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const { status } = await req.json();
    const expense = await updateExpenseStatus(id, status, session.id);
    return NextResponse.json(expense);
  } catch (err: any) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}
