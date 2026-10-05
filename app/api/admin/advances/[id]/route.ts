import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { updateAdvanceStatus } from "@/lib/db/admin-service";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const { status } = await req.json();
    const advance = await updateAdvanceStatus(id, status, session.id);
    return NextResponse.json(advance);
  } catch (err: any) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const { prisma } = await import("@/lib/db/prisma");
    await prisma.driverAdvance.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}
