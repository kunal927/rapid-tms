import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getDpds, createDpd } from "@/lib/db/admin-service";

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");

  try {
    const data = await getDpds({ search, page });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { code, name, city, state, address, contactPerson, contactPhone, contactEmail, ratePerOrderDefault } = body;

    if (!code || !name || !city) {
      return NextResponse.json({ message: "Code, name and city are required" }, { status: 400 });
    }

    const dpd = await createDpd({
      code, name, city, state, address, contactPerson, contactPhone, contactEmail,
      ratePerOrderDefault: ratePerOrderDefault ?? 0,
    });

    return NextResponse.json(dpd, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ message: "DPD code already exists" }, { status: 409 });
    }
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
