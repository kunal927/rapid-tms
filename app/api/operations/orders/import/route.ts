import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { importOrdersToTrip } from "@/lib/db/operations-service";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "OPERATIONS_MANAGER" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const tripId = formData.get("tripId") as string | null;

    if (!tripId) {
      return NextResponse.json({ message: "tripId is required" }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ message: "Excel file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

    if (rawRows.length === 0) {
      return NextResponse.json({ message: "Sheet has no data rows" }, { status: 400 });
    }

    const ordersToImport = rawRows.map((r, i) => {
      const get = (...keys: string[]) => {
        for (const k of keys) {
          const found = Object.keys(r).find(rk => rk.trim().toLowerCase() === k.toLowerCase());
          if (found && r[found] !== undefined && r[found] !== "") return String(r[found]).trim();
        }
        return "";
      };

      return {
        orderNumber: get("order id", "order no", "tracking no", "order_id", "order_no"),
        recipientName: get("customer", "customer name", "recipient", "name") || `Customer ${i + 1}`,
        recipientPhone: get("phone", "mobile", "contact", "customer phone") || "9876543210",
        deliveryAddress: get("address", "delivery address", "destination") || "Delivery Address",
        city: get("city") || "Delhi",
        pincode: get("pincode", "zip", "postal code") || "110001",
        packageDetails: get("package", "package details", "item", "description"),
        codAmount: parseFloat(get("cod", "cod amount", "amount") || "0"),
      };
    });

    const result = await importOrdersToTrip(tripId, ordersToImport, session.id);
    return NextResponse.json({
      success: true,
      totalRows: rawRows.length,
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
