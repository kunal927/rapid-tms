import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "OPERATIONS_MANAGER" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Trip not found" }, { status: 404 });

    // Operations can only edit trip details before start
    if (existing.status === "COMPLETED" || existing.status === "CANCELLED") {
      return NextResponse.json({ message: `Cannot modify trip in ${existing.status} status` }, { status: 400 });
    }

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        notes: body.notes !== undefined ? body.notes : existing.notes,
        startKm: body.startKm !== undefined ? parseInt(body.startKm, 10) : existing.startKm,
        endKm: body.endKm !== undefined ? parseInt(body.endKm, 10) : existing.endKm,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
