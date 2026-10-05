import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getAdvances, createAdvance } from "@/lib/db/admin-service";

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  try {
    const data = await getAdvances({
      driverId: searchParams.get("driverId") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      page: parseInt(searchParams.get("page") ?? "1"),
    });
    return NextResponse.json(data);
  } catch (err: any) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.driverId || !body.amount) return NextResponse.json({ message: "Driver and amount required" }, { status: 400 });
    const advance = await createAdvance({ ...body, approvedById: session.id });
    return NextResponse.json(advance, { status: 201 });
  } catch (err: any) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}
