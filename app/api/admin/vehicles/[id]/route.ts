import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/db/admin-service";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(["SUPER_ADMIN", "OPERATIONS_MANAGER"]);
    const { id } = await params;
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ vehicle });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(["SUPER_ADMIN"]);
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    await createAuditLog({
      userId: session.id,
      action: "UPDATE_VEHICLE",
      entity: "Vehicle",
      entityId: id,
      oldValue: existing as unknown as Record<string, unknown>,
      newValue: body,
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({ vehicle: updated });
  } catch (err) {
    console.error("Update vehicle error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(["SUPER_ADMIN"]);
    const { id } = await params;

    await prisma.vehicle.update({ where: { id }, data: { deletedAt: new Date(), status: "INACTIVE" } });

    await createAuditLog({
      userId: session.id,
      action: "DELETE_VEHICLE",
      entity: "Vehicle",
      entityId: id,
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
