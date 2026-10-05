import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ message: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Record<string, unknown>[];

    const rows = rawRows.map((raw, idx) => {
      const errors: string[] = [];

      // Normalize column keys (case-insensitive, trim)
      const norm: Record<string, string> = {};
      for (const k of Object.keys(raw)) {
        norm[k.toLowerCase().trim().replace(/\s+/g, "_")] = String(raw[k] ?? "").trim();
      }

      const date = norm["date"] ?? "";
      const vehicleNo = norm["vehicle_no."] ?? norm["vehicle_no"] ?? norm["vehicle_number"] ?? "";
      const tripNo = norm["trip_no."] ?? norm["trip_no"] ?? norm["trip_number"] ?? "";
      const driver = norm["driver"] ?? norm["driver_name"] ?? "";
      const driverAdvance = parseFloat(norm["driver_advance"] ?? "0") || 0;
      const dpdName = norm["dpd_name"] ?? norm["dpd"] ?? "";
      const dpdAdvance = parseFloat(norm["dpd_advance"] ?? "0") || 0;
      const ordersInTrip = parseInt(norm["orders_in_trip"] ?? norm["total_orders"] ?? "0") || 0;
      const ordersDelivered = parseInt(norm["orders_delivered"] ?? "0") || 0;
      const perOrder = parseFloat(norm["per_order"] ?? norm["rate_per_order"] ?? "0") || 0;
      const driverPayment = parseFloat(norm["driver_payment"] ?? "0") || 0;

      if (!vehicleNo) errors.push("Vehicle No. is required");
      if (!driver) errors.push("Driver name is required");
      if (!dpdName) errors.push("DPD Name is required");
      if (ordersInTrip === 0) errors.push("Orders in Trip must be > 0");

      return {
        rowIndex: idx + 2,
        date: date || new Date().toISOString().slice(0, 10),
        vehicleNo,
        tripNo,
        driver,
        driverAdvance,
        dpdName,
        dpdAdvance,
        ordersInTrip,
        ordersDelivered,
        perOrder,
        driverPayment,
        errors,
        isDuplicate: false, // Will check on commit
      };
    });

    return NextResponse.json({ rows, total: rows.length });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
