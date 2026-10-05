import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getOperationalReportData } from "@/lib/db/operations-service";
import * as XLSX from "xlsx";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "OPERATIONS_MANAGER" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { reportId } = await params;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const to = searchParams.get("to") ?? new Date().toISOString().slice(0, 10);
  const format = searchParams.get("format") ?? "excel";

  const dateFrom = new Date(from);
  const dateTo = new Date(to + "T23:59:59");

  try {
    const rawData = await getOperationalReportData(reportId, dateFrom, dateTo);

    if (format === "json") {
      return NextResponse.json({ reportId, count: (rawData as any[]).length, data: rawData });
    }

    // Excel Export
    let flatRows: Record<string, unknown>[] = [];

    if (reportId === "daily-trips" || reportId === "trip-completion") {
      flatRows = (rawData as any[]).map(t => ({
        "Trip No": t.tripNumber,
        "Date": new Date(t.tripDate).toLocaleDateString("en-IN"),
        "Vehicle": t.vehicle?.vehicleNumber ?? "-",
        "Driver": t.driver?.user?.name ?? "-",
        "DPD": t.dpd?.name ?? "-",
        "Total Orders": t.totalOrders,
        "Delivered": t.deliveredOrders,
        "Failed": t.failedOrders,
        "Status": t.status,
      }));
    } else if (reportId === "vehicle-utilization") {
      flatRows = (rawData as any[]).map(v => ({
        "Vehicle Number": v.vehicleNumber,
        "Type": v.vehicleType,
        "Status": v.status,
        "Total Trips": v.totalTrips,
        "Total Orders": v.totalOrders,
        "Delivered": v.deliveredOrders,
      }));
    } else if (reportId === "driver-trips") {
      flatRows = (rawData as any[]).map(d => ({
        "Driver Code": d.driverCode,
        "Name": d.name,
        "Phone": d.phone,
        "Total Trips": d.totalTrips,
        "Total Orders": d.totalOrders,
        "Delivered": d.deliveredOrders,
        "Failed": d.failedOrders,
      }));
    } else {
      flatRows = (rawData as any[]).map(o => ({
        "Order ID": o.orderNumber,
        "Customer": o.recipientName,
        "Phone": o.recipientPhone,
        "Address": o.deliveryAddress,
        "City": o.city,
        "Trip": o.trip?.tripNumber ?? "-",
        "Driver": o.trip?.driver?.user?.name ?? "-",
        "Status": o.status,
        "Date": new Date(o.createdAt).toLocaleDateString("en-IN"),
      }));
    }

    const ws = XLSX.utils.json_to_sheet(flatRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Operations Report");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Operations_${reportId}_${from}_${to}.xlsx"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
