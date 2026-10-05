import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import {
  getVehicleProfileWithExpenses,
  addVehicleRepairExpense,
} from "@/lib/db/vehicle-expense-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const profile = await getVehicleProfileWithExpenses(id);
    return NextResponse.json({ success: true, ...profile });
  } catch (error: any) {
    console.error("Get vehicle expenses error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch vehicle profile" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      driverId,
      serviceDate,
      serviceTime,
      serviceType,
      cost,
      odometerReading,
      workshopName,
      invoiceNumber,
      invoiceUrl,
      description,
    } = body;

    if (!cost || Number(cost) <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid expense cost is required" },
        { status: 400 }
      );
    }

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Please enter description of what broke or repair details" },
        { status: 400 }
      );
    }

    const result = await addVehicleRepairExpense({
      vehicleId: id,
      driverId: driverId || undefined,
      serviceDate: serviceDate || new Date(),
      serviceTime: serviceTime || undefined,
      serviceType: serviceType || "MECHANICAL",
      cost: Number(cost),
      odometerReading: odometerReading ? Number(odometerReading) : undefined,
      workshopName,
      invoiceNumber,
      invoiceUrl,
      description,
      userId: session.id,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Add vehicle repair expense error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record repair expense" },
      { status: 500 }
    );
  }
}
