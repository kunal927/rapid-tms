import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { resolveDriverContext, getDriverExpenses, createDriverExpense } from "@/lib/db/driver-service";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const driver = await resolveDriverContext(session.id, session.driverId);
    const expenses = await getDriverExpenses(driver.id);
    return NextResponse.json({ success: true, expenses });
  } catch (error: any) {
    console.error("Get Driver Expenses error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const driver = await resolveDriverContext(session.id, session.driverId);
    const body = await request.json();
    const { tripId, category, amount, notes, receiptUrl } = body;

    if (!category || !amount || Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: "Valid category and amount are required" }, { status: 400 });
    }

    const result = await createDriverExpense(driver.id, {
      tripId,
      category,
      amount: Number(amount),
      notes,
      receiptUrl,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Driver Expense submit error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to log expense" }, { status: 500 });
  }
}
