import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/db/admin-service";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(["SUPER_ADMIN"]);
    const { id } = await params;
    const body = await req.json();

    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) return NextResponse.json({ error: "Driver not found" }, { status: 404 });

    const updated = await prisma.driver.update({ where: { id }, data: body });

    await createAuditLog({
      userId: session.id,
      action: "UPDATE_DRIVER",
      entity: "Driver",
      entityId: id,
      oldValue: driver as unknown as Record<string, unknown>,
      newValue: body,
    });

    return NextResponse.json({ driver: updated });
  } catch (err) {
    console.error("Update driver error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(["SUPER_ADMIN", "OPERATIONS_MANAGER"]);
    const { id } = await params;
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: { user: true, trips: { orderBy: { tripDate: "desc" }, take: 10, include: { vehicle: true, dpd: true } }, advances: { orderBy: { createdAt: "desc" }, take: 10 }, expenses: { orderBy: { createdAt: "desc" }, take: 10 } },
    });
    if (!driver) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ driver });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
