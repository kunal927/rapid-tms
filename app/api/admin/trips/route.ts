import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getTripsAdmin, createTrip } from "@/lib/db/admin-service";
import { prisma } from "@/lib/db/prisma";

function generateTripNumber() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TRP-${yyyy}${mm}${dd}-${rand}`;
}

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "ALL";
  const page = parseInt(searchParams.get("page") ?? "1");

  try {
    const data = await getTripsAdmin({ search, status, page });
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
    const { tripDate, vehicleId, driverId, dpdId, totalOrders, perOrderRate, dpdAdvance, driverAdvance, notes } = body;

    if (!vehicleId || !driverId || !dpdId || !totalOrders) {
      return NextResponse.json({ message: "Vehicle, driver, DPD and total orders are required" }, { status: 400 });
    }

    const tripNumber = generateTripNumber();

    const trip = await createTrip({
      tripNumber,
      tripDate: new Date(tripDate),
      vehicleId,
      driverId,
      dpdId,
      totalOrders: parseInt(totalOrders),
      perOrderRate: parseFloat(perOrderRate ?? "0"),
      dpdAdvance: parseFloat(dpdAdvance ?? "0"),
      driverAdvance: parseFloat(driverAdvance ?? "0"),
      notes,
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
