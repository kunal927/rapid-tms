import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { createOperationsOrder, getOperationsOrders } from "@/lib/db/operations-service";

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "OPERATIONS_MANAGER" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "30", 10);
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const tripId = searchParams.get("tripId") ?? undefined;
  const date = searchParams.get("date") ?? undefined;

  try {
    const data = await getOperationsOrders({ page, limit, search, status, tripId, date });
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
    const order = await createOperationsOrder({
      orderNumber: body.orderNumber,
      tripId: body.tripId,
      dpdId: body.dpdId,
      recipientName: body.recipientName,
      recipientPhone: body.recipientPhone,
      deliveryAddress: body.deliveryAddress,
      city: body.city,
      pincode: body.pincode,
      packageDetails: body.packageDetails,
      weightKg: body.weightKg ? parseFloat(body.weightKg) : undefined,
      codAmount: body.codAmount ? parseFloat(body.codAmount) : undefined,
      userId: session.id,
    });
    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
