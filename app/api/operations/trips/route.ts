import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { createOperationsTrip, getOperationsTrips } from "@/lib/db/operations-service";

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "OPERATIONS_MANAGER" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const date = searchParams.get("date") ?? undefined;
  const driverId = searchParams.get("driverId") ?? undefined;
  const vehicleId = searchParams.get("vehicleId") ?? undefined;
  const dpdId = searchParams.get("dpdId") ?? undefined;

  try {
    const data = await getOperationsTrips({
      page,
      limit,
      search,
      status,
      date,
      driverId,
      vehicleId,
      dpdId,
    });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "OPERATIONS_MANAGER" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const trip = await createOperationsTrip({
      tripDate: new Date(body.tripDate),
      tripNumber: body.tripNumber,
      vehicleId: body.vehicleId,
      driverId: body.driverId,
      dpdId: body.dpdId,
      notes: body.notes,
      startKm: body.startKm ? parseInt(body.startKm, 10) : undefined,
      userId: session.id,
    });
    return NextResponse.json(trip, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
