import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getUsers } from "@/lib/db/admin-service";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  try {
    const data = await getUsers({
      search: searchParams.get("search") ?? "",
      role: searchParams.get("role") ?? undefined,
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: parseInt(searchParams.get("limit") ?? "20"),
    });
    return NextResponse.json(data);
  } catch (err: any) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const { name, email, phone, password, role } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Name, email and password are required" }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, phone: phone || undefined, passwordHash, role: role ?? "OPERATIONS_MANAGER" },
    });
    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ message: "Email or phone already exists" }, { status: 409 });
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
