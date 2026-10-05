import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = {};
    if (typeof body.isActive === "boolean") updateData.isActive = body.isActive;
    if (body.resetPassword) {
      updateData.passwordHash = await bcrypt.hash(body.resetPassword, 12);
    }
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.role) updateData.role = body.role;
    const user = await prisma.user.update({ where: { id }, data: updateData });
    return NextResponse.json({ id: user.id, name: user.name, isActive: user.isActive });
  } catch (err: any) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}
