import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getExpenses, updateExpenseStatus } from "@/lib/db/admin-service";

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  try {
    const data = await getExpenses({
      driverId: searchParams.get("driverId") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      page: parseInt(searchParams.get("page") ?? "1"),
    });
    return NextResponse.json(data);
  } catch (err: any) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}
