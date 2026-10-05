import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getMaintenanceRecords, createMaintenanceRecord } from "@/lib/db/admin-service";

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  try {
    const data = await getMaintenanceRecords({
      vehicleId: searchParams.get("vehicleId") ?? undefined,
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
    if (!body.vehicleId || !body.serviceType || !body.cost) {
      return NextResponse.json({ message: "Vehicle, service type and cost are required" }, { status: 400 });
    }
    const record = await createMaintenanceRecord({
      ...body,
      serviceDate: new Date(body.serviceDate),
    });
    return NextResponse.json(record, { status: 201 });
  } catch (err: any) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}
