import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getReportTrips, getDriverPerformanceReport } from "@/lib/db/admin-service";
import { prisma } from "@/lib/db/prisma";

// Excel generation using xlsx library
import * as XLSX from "xlsx";

async function generateExcelBuffer(reportId: string, dateFrom: Date, dateTo: Date): Promise<Buffer> {
  let data: any[] = [];
  let headers: string[] = [];

  switch (reportId) {
    case "daily-trips": {
      const trips = await getReportTrips(dateFrom, dateTo);
      headers = ["Trip No.", "Date", "Vehicle", "Driver", "DPD", "Total Orders", "Delivered", "Failed", "Rate/Order", "Gross Pay", "Status"];
      data = trips.map(t => ({
        "Trip No.": t.tripNumber,
        "Date": new Date(t.tripDate).toLocaleDateString("en-IN"),
        "Vehicle": t.vehicle.vehicleNumber,
        "Driver": t.driver.user.name,
        "DPD": t.dpd.name,
        "Total Orders": t.totalOrders,
        "Delivered": t.deliveredOrders,
        "Failed": t.failedOrders,
        "Rate/Order": Number(t.perOrderRate),
        "Gross Pay": t.deliveredOrders * Number(t.perOrderRate),
        "Status": t.status,
      }));
      break;
    }

    case "driver-performance": {
      const drivers = await getDriverPerformanceReport(dateFrom, dateTo);
      headers = ["Driver", "Code", "Total Trips", "Total Orders", "Delivered", "Earnings"];
      data = drivers.map(d => ({
        "Driver": d.name,
        "Code": d.driverCode,
        "Total Trips": d.totalTrips,
        "Total Orders": d.totalOrders,
        "Delivered": d.deliveredOrders,
        "Earnings": d.grossEarnings,
      }));
      break;
    }

    case "delivery-report": {
      const orders = await prisma.order.findMany({
        where: { createdAt: { gte: dateFrom, lte: dateTo } },
        include: { trip: { include: { driver: { include: { user: true } }, vehicle: true } }, dpd: true },
        orderBy: { createdAt: "asc" },
      });
      headers = ["Order No.", "Customer", "Phone", "City", "DPD", "Status", "Driver", "Date"];
      data = orders.map(o => ({
        "Order No.": o.orderNumber,
        "Customer": o.recipientName,
        "Phone": o.recipientPhone,
        "City": o.city,
        "DPD": o.dpd.name,
        "Status": o.status,
        "Driver": o.trip?.driver?.user?.name ?? "—",
        "Date": new Date(o.createdAt).toLocaleDateString("en-IN"),
      }));
      break;
    }

    case "fuel-report": {
      const fuels = await prisma.vehicleFuel.findMany({
        where: { fuelDate: { gte: dateFrom, lte: dateTo } },
        include: { vehicle: true, driver: { include: { user: true } } },
        orderBy: { fuelDate: "asc" },
      });
      headers = ["Date", "Vehicle", "Driver", "Litres", "Rate/L", "Total", "Odometer", "Station"];
      data = fuels.map(f => ({
        "Date": new Date(f.fuelDate).toLocaleDateString("en-IN"),
        "Vehicle": f.vehicle.vehicleNumber,
        "Driver": f.driver?.user?.name ?? "—",
        "Litres": Number(f.quantityLiters),
        "Rate/L": Number(f.ratePerLiter),
        "Total": Number(f.totalAmount),
        "Odometer": f.odometerReading ?? "—",
        "Station": f.fuelStation ?? "—",
      }));
      break;
    }

    case "advance-report": {
      const advances = await prisma.driverAdvance.findMany({
        where: { requestDate: { gte: dateFrom, lte: dateTo } },
        include: { driver: { include: { user: true } }, approvedBy: true },
        orderBy: { requestDate: "asc" },
      });
      headers = ["Driver", "Amount", "Date", "Status", "Mode", "Approved By"];
      data = advances.map(a => ({
        "Driver": a.driver.user.name,
        "Amount": Number(a.amount),
        "Date": new Date(a.requestDate).toLocaleDateString("en-IN"),
        "Status": a.status,
        "Mode": a.paymentMode,
        "Approved By": a.approvedBy?.name ?? "—",
      }));
      break;
    }

    case "expense-report": {
      const expenses = await prisma.driverExpense.findMany({
        where: { date: { gte: dateFrom, lte: dateTo } },
        include: { driver: { include: { user: true } }, approvedBy: true },
        orderBy: { date: "asc" },
      });
      headers = ["Driver", "Category", "Amount", "Date", "Status", "Approved By"];
      data = expenses.map(e => ({
        "Driver": e.driver.user.name,
        "Category": e.category,
        "Amount": Number(e.amount),
        "Date": new Date(e.date).toLocaleDateString("en-IN"),
        "Status": e.status,
        "Approved By": e.approvedBy?.name ?? "—",
      }));
      break;
    }

    case "maintenance-report": {
      const records = await prisma.vehicleMaintenance.findMany({
        where: { serviceDate: { gte: dateFrom, lte: dateTo } },
        include: { vehicle: true },
        orderBy: { serviceDate: "asc" },
      });
      headers = ["Date", "Vehicle", "Service Type", "Cost", "Odometer", "Workshop", "Invoice"];
      data = records.map(r => ({
        "Date": new Date(r.serviceDate).toLocaleDateString("en-IN"),
        "Vehicle": r.vehicle.vehicleNumber,
        "Service Type": r.serviceType,
        "Cost": Number(r.cost),
        "Odometer": r.odometerReading ?? "—",
        "Workshop": r.workshopName ?? "—",
        "Invoice": r.invoiceNumber ?? "—",
      }));
      break;
    }

    case "attendance-report": {
      const records = await prisma.driverAttendance.findMany({
        where: { date: { gte: dateFrom, lte: dateTo } },
        include: { driver: { include: { user: true } } },
        orderBy: { date: "asc" },
      });
      headers = ["Date", "Driver", "Status", "Check In", "Check Out"];
      data = records.map(r => ({
        "Date": new Date(r.date).toLocaleDateString("en-IN"),
        "Driver": r.driver.user.name,
        "Status": r.status,
        "Check In": r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString("en-IN") : "—",
        "Check Out": r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString("en-IN") : "—",
      }));
      break;
    }

    default:
      data = [];
      headers = [];
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buf;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") {
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
    if (format === "excel") {
      const buffer = await generateExcelBuffer(reportId, dateFrom, dateTo);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${reportId}_${from}_to_${to}.xlsx"`,
        },
      });
    } else {
      // Preview: return row count
      const buffer = await generateExcelBuffer(reportId, dateFrom, dateTo);
      return NextResponse.json({ reportId, from, to, rowCount: "generated", status: "ok" });
    }
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
