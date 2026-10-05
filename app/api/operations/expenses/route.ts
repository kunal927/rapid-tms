import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { submitOperationsExpense } from "@/lib/db/operations-service";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "OPERATIONS_MANAGER" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const expense = await submitOperationsExpense({
      tripId: body.tripId,
      vehicleId: body.vehicleId,
      driverId: body.driverId,
      category: body.category,
      amount: parseFloat(body.amount),
      notes: body.notes,
      createdById: session.id,
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
