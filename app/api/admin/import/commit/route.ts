import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

function generateTripNumber() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TRP-${yyyy}${mm}${dd}-${rand}`;
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const row = await req.json();
    const { vehicleNo, driver, dpdName, date, ordersInTrip, ordersDelivered, perOrder, driverAdvance, dpdAdvance, tripNo } = row;

    // Look up vehicle by number
    const vehicle = await prisma.vehicle.findFirst({
      where: { vehicleNumber: { contains: vehicleNo }, deletedAt: null },
    });
    if (!vehicle) return NextResponse.json({ message: `Vehicle "${vehicleNo}" not found` }, { status: 422 });

    // Look up driver by name
    const driverRecord = await prisma.driver.findFirst({
      where: { user: { name: { contains: driver } }, deletedAt: null },
    });
    if (!driverRecord) return NextResponse.json({ message: `Driver "${driver}" not found` }, { status: 422 });

    // Look up DPD by name
    const dpd = await prisma.dpd.findFirst({ where: { name: { contains: dpdName } } });
    if (!dpd) return NextResponse.json({ message: `DPD "${dpdName}" not found` }, { status: 422 });

    // Check duplicate by tripNo (if provided)
    if (tripNo) {
      const existing = await prisma.trip.findFirst({ where: { tripNumber: tripNo } });
      if (existing) return NextResponse.json({ message: `Trip ${tripNo} already exists (duplicate)` }, { status: 409 });
    }

    // Parse trip date
    const tripDate = date ? new Date(date) : new Date();

    // Create trip
    const tripNumber = tripNo || generateTripNumber();
    const trip = await prisma.trip.create({
      data: {
        tripNumber,
        tripDate,
        vehicleId: vehicle.id,
        driverId: driverRecord.id,
        dpdId: dpd.id,
        totalOrders: parseInt(ordersInTrip) || 0,
        deliveredOrders: parseInt(ordersDelivered) || 0,
        perOrderRate: parseFloat(perOrder) || 0,
        dpdAdvance: parseFloat(dpdAdvance) || 0,
        driverAdvance: parseFloat(driverAdvance) || 0,
        status: "COMPLETED",
        startTime: tripDate,
        endTime: tripDate,
      },
    });

    return NextResponse.json({ ok: true, tripId: trip.id, tripNumber: trip.tripNumber }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
