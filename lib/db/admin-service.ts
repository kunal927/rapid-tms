"use server";

import { prisma } from "./prisma";
import { Role } from "../auth/types";
import { Prisma } from "@prisma/client";

// ─── Dashboard KPIs ────────────────────────────────────────────────────────────

export async function getAdminDashboardMetrics(dateFrom?: Date, dateTo?: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const from = dateFrom ?? today;
  const to = dateTo ?? tomorrow;

  const [
    totalVehicles,
    activeVehicles,
    availableVehicles,
    totalDrivers,
    activeDrivers,
    todayTrips,
    runningTrips,
    completedToday,
    totalOrders,
    deliveredOrders,
    pendingOrders,
    totalDriverPayments,
    totalExpenses,
    outstandingAdvances,
  ] = await Promise.all([
    prisma.vehicle.count({ where: { deletedAt: null } }),
    prisma.vehicle.count({ where: { deletedAt: null, status: { not: "INACTIVE" } } }),
    prisma.vehicle.count({ where: { deletedAt: null, status: "AVAILABLE" } }),
    prisma.driver.count({ where: { deletedAt: null } }),
    prisma.driver.count({ where: { deletedAt: null, status: { not: "INACTIVE" } } }),
    prisma.trip.count({ where: { tripDate: { gte: from, lt: to }, deletedAt: null } }),
    prisma.trip.count({ where: { status: { in: ["STARTED", "RUNNING"] }, deletedAt: null } }),
    prisma.trip.count({ where: { tripDate: { gte: from, lt: to }, status: "COMPLETED", deletedAt: null } }),
    prisma.order.count({ where: { createdAt: { gte: from, lt: to } } }),
    prisma.order.count({ where: { status: "DELIVERED", createdAt: { gte: from, lt: to } } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "OUT_FOR_DELIVERY"] }, createdAt: { gte: from, lt: to } } }),
    prisma.driverPayment.aggregate({ _sum: { netPayment: true }, where: { createdAt: { gte: from, lt: to } } }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: from, lt: to } } }),
    prisma.driverAdvance.aggregate({ _sum: { amount: true }, where: { status: "APPROVED", createdAt: { gte: from, lt: to } } }),
  ]);

  // Comprehensive Financials: Total Credit & Total Debit (Automated aggregation of all heads)
  const [
    maintAgg,
    fuelAgg,
    driverPaymentsPaidAgg,
    driverAdvancesApprovedAgg,
    generalExpensesAgg,
    tripExpensesAgg,
    driverExpensesApprovedAgg,
    vehicleExpensesAgg,
    clientCreditsAgg,
    dpdAdvancesAgg,
    codDeliveredAgg,
    tripsRevenueList,
  ] = await Promise.all([
    prisma.vehicleMaintenance.aggregate({ _sum: { cost: true }, where: { serviceDate: { gte: from, lt: to } } }),
    prisma.vehicleFuel.aggregate({ _sum: { totalAmount: true }, where: { fuelDate: { gte: from, lt: to } } }),
    prisma.driverPayment.aggregate({ _sum: { netPayment: true }, where: { paymentStatus: "PAID", createdAt: { gte: from, lt: to } } }),
    prisma.driverAdvance.aggregate({ _sum: { amount: true }, where: { status: "APPROVED", createdAt: { gte: from, lt: to } } }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: from, lt: to } } }),
    prisma.tripExpense.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: from, lt: to } } }),
    prisma.driverExpense.aggregate({ _sum: { amount: true }, where: { status: "APPROVED", createdAt: { gte: from, lt: to } } }),
    prisma.vehicleExpense.aggregate({ _sum: { amount: true }, where: { expenseDate: { gte: from, lt: to } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { type: "CREDIT", createdAt: { gte: from, lt: to } } }),
    prisma.trip.aggregate({ _sum: { dpdAdvance: true }, where: { tripDate: { gte: from, lt: to }, deletedAt: null } }),
    prisma.order.aggregate({ _sum: { codAmount: true }, where: { status: "DELIVERED", createdAt: { gte: from, lt: to } } }),
    prisma.trip.findMany({ select: { deliveredOrders: true, perOrderRate: true }, where: { tripDate: { gte: from, lt: to }, deletedAt: null } }),
  ]);

  const maintenanceTotal = Number(maintAgg._sum.cost ?? 0);
  const fuelTotal = Number(fuelAgg._sum.totalAmount ?? 0);
  const driverPaymentsTotal = Number(driverPaymentsPaidAgg._sum.netPayment ?? 0);
  const driverAdvancesTotal = Number(driverAdvancesApprovedAgg._sum.amount ?? 0);
  const operationalExpensesTotal =
    Number(generalExpensesAgg._sum.amount ?? 0) +
    Number(tripExpensesAgg._sum.amount ?? 0) +
    Number(driverExpensesApprovedAgg._sum.amount ?? 0) +
    Number(vehicleExpensesAgg._sum.amount ?? 0);

  // Total Debit is the automatic sum of ALL expenses:
  // Maintenance/Repairs + Fuel/CNG + Driver Payments + Driver Advances + Operations/Toll/Fastag
  const totalDebit = maintenanceTotal + fuelTotal + driverPaymentsTotal + driverAdvancesTotal + operationalExpensesTotal;

  // Total Credit is the sum of client invoices, DPD advances, delivered order freight, and delivered COD collections
  const clientPaymentsTotal = Number(clientCreditsAgg._sum.amount ?? 0);
  const dpdAdvancesTotal = Number(dpdAdvancesAgg._sum.dpdAdvance ?? 0);
  const freightRevenueTotal = tripsRevenueList.reduce((sum, t) => sum + (Number(t.deliveredOrders) * Number(t.perOrderRate)), 0);
  const codCollectionsTotal = Number(codDeliveredAgg._sum.codAmount ?? 0);

  const totalCredit = clientPaymentsTotal + dpdAdvancesTotal + freightRevenueTotal + codCollectionsTotal;
  const netBalance = totalCredit - totalDebit;

  // Trip performance by period
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [weekTrips, monthTrips, weekOrders, monthOrders] = await Promise.all([
    prisma.trip.findMany({ where: { tripDate: { gte: weekStart }, deletedAt: null }, select: { status: true, totalOrders: true, deliveredOrders: true } }),
    prisma.trip.findMany({ where: { tripDate: { gte: monthStart }, deletedAt: null }, select: { status: true, totalOrders: true, deliveredOrders: true } }),
    prisma.order.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
  ]);

  return {
    vehicles: { total: totalVehicles, active: activeVehicles, available: availableVehicles },
    drivers: { total: totalDrivers, active: activeDrivers },
    trips: {
      today: todayTrips,
      running: runningTrips,
      completedToday,
      thisWeek: weekTrips.length,
      thisMonth: monthTrips.length,
    },
    orders: {
      total: totalOrders,
      delivered: deliveredOrders,
      pending: pendingOrders,
      weekTotal: weekOrders,
      monthTotal: monthOrders,
      deliveryRate: totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0,
    },
    financial: {
      todayPayments: Number(totalDriverPayments._sum.netPayment ?? 0),
      todayExpenses: Number(totalExpenses._sum.amount ?? 0),
      outstandingAdvances: Number(outstandingAdvances._sum.amount ?? 0),
      totalCredit,
      totalDebit,
      netBalance,
      breakdown: {
        maintenance: maintenanceTotal,
        fuel: fuelTotal,
        driverPayments: driverPaymentsTotal,
        driverAdvances: driverAdvancesTotal,
        operational: operationalExpensesTotal,
      },
      creditBreakdown: {
        clientInward: clientPaymentsTotal,
        dpdAdvances: dpdAdvancesTotal,
        freightRevenue: freightRevenueTotal,
        codDelivered: codCollectionsTotal,
      },
    },
    weekPerformance: {
      completed: weekTrips.filter(t => t.status === "COMPLETED").length,
      totalOrders: weekTrips.reduce((s, t) => s + t.totalOrders, 0),
      delivered: weekTrips.reduce((s, t) => s + t.deliveredOrders, 0),
    },
    monthPerformance: {
      completed: monthTrips.filter(t => t.status === "COMPLETED").length,
      totalOrders: monthTrips.reduce((s, t) => s + t.totalOrders, 0),
      delivered: monthTrips.reduce((s, t) => s + t.deliveredOrders, 0),
    },
  };
}

// ─── Vehicle Management ────────────────────────────────────────────────────────

export async function getVehicles(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { search = "", status, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deletedAt: null };
  if (status && status !== "ALL") where.status = status;
  if (search) {
    where.OR = [
      { vehicleNumber: { contains: search } },
      { vehicleType: { contains: search } },
      { make: { contains: search } },
    ];
  }

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      skip,
      take: limit,
      include: {
        trips: { where: { status: { in: ["STARTED", "RUNNING"] } }, include: { driver: { include: { user: true } } }, take: 1 },
        _count: { select: { trips: true, fuelRecords: true, maintenance: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vehicle.count({ where }),
  ]);

  return { vehicles, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getVehicleById(id: string) {
  return prisma.vehicle.findUnique({
    where: { id },
    include: {
      documents: { orderBy: { createdAt: "desc" } },
      fuelRecords: { orderBy: { fuelDate: "desc" }, take: 20, include: { driver: { include: { user: true } } } },
      maintenance: { orderBy: { serviceDate: "desc" }, take: 20 },
      vehicleExpenses: { orderBy: { expenseDate: "desc" }, take: 20 },
      trips: {
        orderBy: { tripDate: "desc" },
        take: 20,
        include: { driver: { include: { user: true } }, dpd: true },
      },
    },
  });
}

export async function createVehicle(data: {
  vehicleNumber: string;
  vehicleType: string;
  make?: string;
  model?: string;
  year?: number;
  capacityTons?: number;
  ownershipType?: string;
  insuranceExpiry?: Date;
  fitnessExpiry?: Date;
  permitExpiry?: Date;
  pollutionExpiry?: Date;
}) {
  return prisma.vehicle.create({ data: data as Parameters<typeof prisma.vehicle.create>[0]["data"] });
}

export async function updateVehicle(id: string, data: Record<string, unknown>) {
  return prisma.vehicle.update({ where: { id }, data });
}

export async function deleteVehicle(id: string) {
  return prisma.vehicle.update({ where: { id }, data: { deletedAt: new Date(), status: "INACTIVE" } });
}

// ─── Driver Management ─────────────────────────────────────────────────────────

export async function getDrivers(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { search = "", status, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deletedAt: null };
  if (status && status !== "ALL") where.status = status;
  if (search) {
    where.OR = [
      { user: { name: { contains: search } } },
      { user: { phone: { contains: search } } },
      { licenseNumber: { contains: search } },
      { driverCode: { contains: search } },
    ];
  }

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: true,
        trips: { where: { status: { in: ["STARTED", "RUNNING"] } }, take: 1 },
        _count: { select: { trips: true, advances: true, expenses: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.driver.count({ where }),
  ]);

  return { drivers, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getDriverById(id: string) {
  return prisma.driver.findUnique({
    where: { id },
    include: {
      user: true,
      documents: { orderBy: { createdAt: "desc" } },
      attendance: { orderBy: { date: "desc" }, take: 31 },
      advances: { orderBy: { createdAt: "desc" }, take: 20, include: { approvedBy: true } },
      expenses: { orderBy: { createdAt: "desc" }, take: 20, include: { approvedBy: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 20 },
      ledger: { orderBy: { createdAt: "desc" }, take: 50 },
      trips: {
        orderBy: { tripDate: "desc" },
        take: 30,
        include: { vehicle: true, dpd: true },
      },
    },
  });
}

export async function getDriverDetailedProfile(params: {
  driverId: string;
  tripPage?: number;
  tripLimit?: number;
  tripStatus?: string;
}) {
  const { driverId, tripPage = 1, tripLimit = 10, tripStatus = "ALL" } = params;
  const skip = (tripPage - 1) * tripLimit;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const tripWhere: Record<string, unknown> = { driverId };
  if (tripStatus && tripStatus !== "ALL") {
    tripWhere.status = tripStatus;
  }

  const [
    driver,
    advances,
    totalTrips,
    monthTrips,
    completedTrips,
    runningTrips,
    trips,
    totalFilteredTrips,
    payments,
    ordersAgg,
    monthTripsList,
  ] = await Promise.all([
    prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        user: true,
        documents: { orderBy: { createdAt: "desc" } },
        attendance: { orderBy: { date: "desc" }, take: 15 },
      },
    }),
    prisma.driverAdvance.findMany({
      where: { driverId },
      include: { trip: true, approvedBy: true },
      orderBy: { requestDate: "desc" },
    }),
    prisma.trip.count({ where: { driverId } }),
    prisma.trip.count({
      where: {
        driverId,
        tripDate: { gte: startOfMonth },
      },
    }),
    prisma.trip.count({ where: { driverId, status: "COMPLETED" } }),
    prisma.trip.count({ where: { driverId, status: "RUNNING" } }),
    prisma.trip.findMany({
      where: tripWhere,
      include: {
        vehicle: true,
        dpd: true,
      },
      orderBy: { tripDate: "desc" },
      skip,
      take: tripLimit,
    }),
    prisma.trip.count({ where: tripWhere }),
    prisma.driverPayment.findMany({
      where: { driverId },
      orderBy: { paymentDate: "desc" },
      take: 10,
    }),
    prisma.trip.aggregate({
      where: { driverId },
      _sum: { deliveredOrders: true, totalOrders: true },
    }),
    prisma.trip.findMany({
      where: {
        driverId,
        tripDate: { gte: startOfMonth },
      },
      select: {
        id: true,
        perOrderRate: true,
        status: true,
      },
    }),
  ]);

  if (!driver) return null;

  // Calculate total advance given by owner to this driver
  const totalAdvanceGiven = advances
    .filter((a) => ["APPROVED", "RECOVERED"].includes(a.status))
    .reduce((sum, a) => sum + Number(a.amount), 0);

  const totalAdvanceRecovered = advances
    .filter((a) => a.status === "RECOVERED")
    .reduce((sum, a) => sum + Number(a.amount), 0);

  const outstandingAdvance = totalAdvanceGiven - totalAdvanceRecovered;

  const totalNetPaid = payments
    .filter((p) => p.paymentStatus === "PAID")
    .reduce((sum, p) => sum + Number(p.netPayment), 0);

  // Calculate monthly earnings based on trips done in current month * chosen trip rate (₹25 or ₹35)
  const monthTripsEarnings = monthTripsList.reduce(
    (sum, t) => sum + Number(t.perOrderRate || 35),
    0
  );

  const latestTripRate = monthTripsList.length > 0
    ? Number(monthTripsList[0].perOrderRate || 35)
    : 35;

  return {
    driver,
    stats: {
      totalAdvanceGiven,
      totalAdvanceRecovered,
      outstandingAdvance,
      totalTrips,
      monthTrips,
      completedTrips,
      runningTrips,
      monthTripsEarnings,
      latestTripRate,
      totalOrdersDelivered: ordersAgg._sum.deliveredOrders ?? 0,
      totalOrdersAssigned: ordersAgg._sum.totalOrders ?? 0,
      totalNetPaid,
      currentVehicle: trips[0]?.vehicle ?? null,
    },
    advances,
    payments,
    trips: {
      items: trips,
      total: totalFilteredTrips,
      page: tripPage,
      limit: tripLimit,
      totalPages: Math.ceil(totalFilteredTrips / tripLimit) || 1,
    },
  };
}

export async function createDriver(data: {
  userId: string;
  driverCode: string;
  licenseNumber: string;
  licenseExpiry?: Date;
  aadharNumber?: string;
  panNumber?: string;
  emergencyContact?: string;
  permanentAddress?: string;
  dateOfJoining?: Date;
  perOrderRate?: number;
}) {
  return prisma.driver.create({ data: data as Parameters<typeof prisma.driver.create>[0]["data"] });
}

export async function updateDriver(id: string, data: Record<string, unknown>) {
  return prisma.driver.update({ where: { id }, data });
}

// ─── DPD Management ───────────────────────────────────────────────────────────

export async function getDpds(params: { search?: string; page?: number; limit?: number }) {
  const { search = "", page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { code: { contains: search } },
      { city: { contains: search } },
    ];
  }

  const [dpds, total] = await Promise.all([
    prisma.dpd.findMany({
      where,
      skip,
      take: limit,
      include: { _count: { select: { trips: true, orders: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.dpd.count({ where }),
  ]);

  return { dpds, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getDpdById(id: string) {
  return prisma.dpd.findUnique({
    where: { id },
    include: {
      trips: { orderBy: { tripDate: "desc" }, take: 20, include: { driver: { include: { user: true } }, vehicle: true } },
      orders: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

export async function createDpd(data: {
  code: string;
  name: string;
  city: string;
  state?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  ratePerOrderDefault?: number;
}) {
  return prisma.dpd.create({ data: data as Parameters<typeof prisma.dpd.create>[0]["data"] });
}

export async function updateDpd(id: string, data: Record<string, unknown>) {
  return prisma.dpd.update({ where: { id }, data });
}

// ─── Trip Management ──────────────────────────────────────────────────────────

export async function getTripsAdmin(params: {
  search?: string;
  status?: string;
  vehicleId?: string;
  driverId?: string;
  dpdId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}) {
  const { search = "", status, vehicleId, driverId, dpdId, dateFrom, dateTo, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deletedAt: null };
  if (status && status !== "ALL") where.status = status;
  if (vehicleId) where.vehicleId = vehicleId;
  if (driverId) where.driverId = driverId;
  if (dpdId) where.dpdId = dpdId;
  if (dateFrom || dateTo) {
    where.tripDate = {};
    if (dateFrom) (where.tripDate as Record<string, unknown>).gte = dateFrom;
    if (dateTo) (where.tripDate as Record<string, unknown>).lte = dateTo;
  }
  if (search) {
    where.OR = [{ tripNumber: { contains: search } }];
  }

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      skip,
      take: limit,
      include: {
        vehicle: true,
        driver: { include: { user: true } },
        dpd: true,
        _count: { select: { orders: true, expenses: true } },
      },
      orderBy: { tripDate: "desc" },
    }),
    prisma.trip.count({ where }),
  ]);

  return { trips, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getTripById(id: string) {
  return prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: { include: { user: true } },
      dpd: true,
      orders: { orderBy: { orderNumber: "asc" } },
      expenses: { orderBy: { createdAt: "desc" } },
      driverAdvances: { include: { approvedBy: true } },
      driverPayments: true,
      fuelRecords: true,
      vehicleExpenses: true,
      assignments: { include: { driver: { include: { user: true } }, vehicle: true } },
    },
  });
}

export async function createTrip(data: {
  tripNumber: string;
  tripDate: Date;
  vehicleId: string;
  driverId: string;
  dpdId: string;
  totalOrders: number;
  perOrderRate: number;
  dpdAdvance?: number;
  driverAdvance?: number;
  notes?: string;
}) {
  return prisma.trip.create({ data: data as Parameters<typeof prisma.trip.create>[0]["data"] });
}

export async function updateTrip(id: string, data: Record<string, unknown>) {
  return prisma.trip.update({ where: { id }, data });
}

// ─── Order Management ─────────────────────────────────────────────────────────

export async function getOrdersAdmin(params: {
  search?: string;
  status?: string;
  tripId?: string;
  dpdId?: string;
  page?: number;
  limit?: number;
}) {
  const { search = "", status, tripId, dpdId, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status && status !== "ALL") where.status = status;
  if (tripId) where.tripId = tripId;
  if (dpdId) where.dpdId = dpdId;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { recipientName: { contains: search } },
      { recipientPhone: { contains: search } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        trip: { include: { driver: { include: { user: true } }, vehicle: true } },
        dpd: true,
        delivery: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page, totalPages: Math.ceil(total / limit) };
}

// ─── Driver Payment Calculation ───────────────────────────────────────────────

export async function calculateDriverPayment(driverId: string, tripId?: string) {
  const where: Record<string, unknown> = { driverId };
  if (tripId) where.id = tripId;

  const trips = await prisma.trip.findMany({
    where: tripId ? { id: tripId, driverId } : { driverId, status: "COMPLETED" },
    include: { driverAdvances: true, driverExpenses: { where: { status: "APPROVED" } } },
  });

  return trips.map(trip => {
    const grossEarnings = trip.deliveredOrders * Number(trip.perOrderRate);
    const totalAdvance = trip.driverAdvances.reduce((s, a) => s + Number(a.amount), 0);
    const totalExpenses = trip.driverExpenses.reduce((s, e) => s + Number(e.amount), 0);
    const netPayment = grossEarnings - totalAdvance + totalExpenses;

    return {
      tripId: trip.id,
      tripNumber: trip.tripNumber,
      deliveredOrders: trip.deliveredOrders,
      perOrderRate: Number(trip.perOrderRate),
      grossEarnings,
      totalAdvance,
      totalExpenses,
      netPayment,
    };
  });
}

export async function getDriverPayments(params: { driverId?: string; page?: number; limit?: number }) {
  const { driverId, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (driverId) where.driverId = driverId;

  const [payments, total] = await Promise.all([
    prisma.driverPayment.findMany({
      where,
      skip,
      take: limit,
      include: { driver: { include: { user: true } }, trip: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.driverPayment.count({ where }),
  ]);

  return { payments, total, page, totalPages: Math.ceil(total / limit) };
}

// ─── Advances ─────────────────────────────────────────────────────────────────

export async function getAdvances(params: { driverId?: string; status?: string; page?: number; limit?: number }) {
  const { driverId, status, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (driverId) where.driverId = driverId;
  if (status && status !== "ALL") where.status = status;

  const [advances, total] = await Promise.all([
    prisma.driverAdvance.findMany({
      where,
      skip,
      take: limit,
      include: {
        driver: { include: { user: true } },
        trip: true,
        approvedBy: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.driverAdvance.count({ where }),
  ]);

  return { advances, total, page, totalPages: Math.ceil(total / limit) };
}

export async function createAdvance(data: {
  driverId: string;
  tripId?: string;
  amount: number;
  paymentMode?: string;
  notes?: string;
  approvedById?: string;
}) {
  return prisma.driverAdvance.create({
    data: {
      ...data,
      status: "APPROVED",
      approvedDate: new Date(),
    } as Parameters<typeof prisma.driverAdvance.create>[0]["data"],
  });
}

export async function updateAdvanceStatus(id: string, status: string, approvedById?: string) {
  return prisma.driverAdvance.update({
    where: { id },
    data: {
      status: status as "REQUESTED" | "APPROVED" | "REJECTED" | "RECOVERED",
      approvedById: approvedById || undefined,
      approvedDate: status === "APPROVED" ? new Date() : undefined,
    },
  });
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export async function getExpenses(params: {
  driverId?: string;
  vehicleId?: string;
  tripId?: string;
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const { driverId, vehicleId, tripId, status, category, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (driverId) where.driverId = driverId;
  if (tripId) where.tripId = tripId;
  if (status && status !== "ALL") where.status = status;
  if (category && category !== "ALL") where.category = category;

  const [expenses, total] = await Promise.all([
    prisma.driverExpense.findMany({
      where,
      skip,
      take: limit,
      include: {
        driver: { include: { user: true } },
        trip: true,
        approvedBy: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.driverExpense.count({ where }),
  ]);

  return { expenses, total, page, totalPages: Math.ceil(total / limit) };
}

export async function updateExpenseStatus(id: string, status: string, approvedById: string) {
  return prisma.driverExpense.update({
    where: { id },
    data: {
      status: status as "PENDING" | "APPROVED" | "REJECTED",
      approvedById,
    },
  });
}

// ─── Consolidated Master Debit Outflow (All Expense Heads) ───────────────────

export interface MasterDebitItem {
  id: string;
  category: "MAINTENANCE" | "FUEL" | "DRIVER_PAYMENT" | "DRIVER_ADVANCE" | "OPERATIONAL" | "VEHICLE_EXPENSE" | "TRIP_TOLL" | "DRIVER_CLAIM";
  categoryLabel: string;
  title: string;
  description: string;
  entityName: string;
  entityType: "VEHICLE" | "DRIVER" | "TRIP" | "OFFICE";
  driverId?: string | null;
  driverName: string;
  driverCode?: string | null;
  vehicleNumber?: string | null;
  amount: number;
  date: Date;
  paymentMode: string;
  status: "APPROVED" | "PAID" | "PENDING";
  receiptUrl?: string | null;
  invoiceNumber?: string | null;
  referenceId?: string | null;
}

export async function getMasterDebitExpenses(params: {
  category?: string;
  driverId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { category = "ALL", driverId = "ALL", search = "", page = 1, limit = 50 } = params;

  // 1. Fetch all expense categories from DB with complete driver and vehicle associations
  const [
    maintenance,
    fuel,
    driverPayments,
    driverAdvances,
    generalExpenses,
    vehicleExpenses,
    tripExpenses,
    driverExpenses,
  ] = await Promise.all([
    prisma.vehicleMaintenance.findMany({
      include: {
        vehicle: {
          include: {
            trips: {
              include: { driver: { include: { user: true } } },
              orderBy: { tripDate: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { serviceDate: "desc" },
    }),
    prisma.vehicleFuel.findMany({
      include: {
        vehicle: {
          include: {
            trips: {
              include: { driver: { include: { user: true } } },
              orderBy: { tripDate: "desc" },
              take: 1,
            },
          },
        },
        driver: { include: { user: true } },
      },
      orderBy: { fuelDate: "desc" },
    }),
    prisma.driverPayment.findMany({
      where: { paymentStatus: "PAID" },
      include: {
        driver: { include: { user: true } },
        trip: { include: { vehicle: true } },
      },
      orderBy: { paymentDate: "desc" },
    }),
    prisma.driverAdvance.findMany({
      where: { status: "APPROVED" },
      include: {
        driver: { include: { user: true } },
        trip: { include: { vehicle: true } },
      },
      orderBy: { approvedDate: "desc" },
    }),
    prisma.expense.findMany({
      where: { status: "APPROVED" },
      orderBy: { expenseDate: "desc" },
    }),
    prisma.vehicleExpense.findMany({
      include: {
        vehicle: {
          include: {
            trips: {
              include: { driver: { include: { user: true } } },
              orderBy: { tripDate: "desc" },
              take: 1,
            },
          },
        },
        trip: {
          include: { driver: { include: { user: true } } },
        },
      },
      orderBy: { expenseDate: "desc" },
    }),
    prisma.tripExpense.findMany({
      include: {
        trip: {
          include: {
            driver: { include: { user: true } },
            vehicle: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.driverExpense.findMany({
      where: { status: "APPROVED" },
      include: {
        driver: { include: { user: true } },
        trip: { include: { vehicle: true } },
      },
      orderBy: { date: "desc" },
    }),
  ]);

  // Calculate totals
  const maintenanceTotal = maintenance.reduce((sum, m) => sum + Number(m.cost), 0);
  const fuelTotal = fuel.reduce((sum, f) => sum + Number(f.totalAmount), 0);
  const driverPaymentsTotal = driverPayments.reduce((sum, p) => sum + Number(p.netPayment), 0);
  const driverAdvancesTotal = driverAdvances.reduce((sum, a) => sum + Number(a.amount), 0);
  const operationalTotal =
    generalExpenses.reduce((sum, e) => sum + Number(e.amount), 0) +
    vehicleExpenses.reduce((sum, v) => sum + Number(v.amount), 0) +
    tripExpenses.reduce((sum, t) => sum + Number(t.amount), 0) +
    driverExpenses.reduce((sum, d) => sum + Number(d.amount), 0);

  const grandTotal = maintenanceTotal + fuelTotal + driverPaymentsTotal + driverAdvancesTotal + operationalTotal;

  // Build unified item list with clear Driver Name and Vehicle Number
  const allItems: MasterDebitItem[] = [];

  for (const m of maintenance) {
    const assignedDriver = m.vehicle.trips[0]?.driver;
    allItems.push({
      id: m.id,
      category: "MAINTENANCE",
      categoryLabel: "Maintenance & Repairs",
      title: `${m.serviceType}: ${m.workshopName || "Garage Repair"}`,
      description: m.description || "Routine maintenance and parts replacement",
      entityName: m.vehicle.vehicleNumber,
      entityType: "VEHICLE",
      driverId: assignedDriver?.id || null,
      driverName: assignedDriver?.user?.name || "Fleet Workshop / Central",
      driverCode: assignedDriver?.driverCode || null,
      vehicleNumber: m.vehicle.vehicleNumber,
      amount: Number(m.cost),
      date: m.serviceDate,
      paymentMode: "BANK_TRANSFER",
      status: "PAID",
      invoiceNumber: m.invoiceNumber,
    });
  }

  for (const f of fuel) {
    const fuelDriver = f.driver || f.vehicle.trips[0]?.driver;
    allItems.push({
      id: f.id,
      category: "FUEL",
      categoryLabel: "Fuel & CNG Refill",
      title: `Fuel Refill: ${Number(f.quantityLiters).toFixed(1)}L @ ₹${Number(f.ratePerLiter).toFixed(1)}/L`,
      description: f.fuelStation ? `${f.fuelStation} (Odo: ${f.odometerReading ?? 0} km)` : "Fuel bunk refill",
      entityName: `${f.vehicle.vehicleNumber}${fuelDriver ? ` • ${fuelDriver.user.name}` : ""}`,
      entityType: "VEHICLE",
      driverId: fuelDriver?.id || null,
      driverName: fuelDriver?.user?.name || "Fleet Vehicle Account",
      driverCode: fuelDriver?.driverCode || null,
      vehicleNumber: f.vehicle.vehicleNumber,
      amount: Number(f.totalAmount),
      date: f.fuelDate,
      paymentMode: "UPI",
      status: "PAID",
    });
  }

  for (const p of driverPayments) {
    allItems.push({
      id: p.id,
      category: "DRIVER_PAYMENT",
      categoryLabel: "Driver Payout",
      title: `Driver Delivery Payout (${p.totalOrdersDelivered} Orders)`,
      description: p.notes || `Gross ₹${Number(p.grossEarnings)} - Adv ₹${Number(p.totalAdvanceDeducted)} + Reimb ₹${Number(p.totalExpensesReimbursed)}`,
      entityName: `${p.driver.user.name} (${p.driver.driverCode})`,
      entityType: "DRIVER",
      driverId: p.driver.id,
      driverName: p.driver.user.name,
      driverCode: p.driver.driverCode,
      vehicleNumber: p.trip?.vehicle?.vehicleNumber || null,
      amount: Number(p.netPayment),
      date: p.paymentDate || p.createdAt,
      paymentMode: "UPI",
      status: "PAID",
      referenceId: p.transactionRef,
    });
  }

  for (const a of driverAdvances) {
    allItems.push({
      id: a.id,
      category: "DRIVER_ADVANCE",
      categoryLabel: "Driver Advance",
      title: "Trip Route Advance Disbursed",
      description: a.notes || "Driver transit cash advance",
      entityName: `${a.driver.user.name} (${a.driver.driverCode})`,
      entityType: "DRIVER",
      driverId: a.driver.id,
      driverName: a.driver.user.name,
      driverCode: a.driver.driverCode,
      vehicleNumber: a.trip?.vehicle?.vehicleNumber || null,
      amount: Number(a.amount),
      date: a.approvedDate || a.requestDate,
      paymentMode: a.paymentMode,
      status: "APPROVED",
    });
  }

  for (const e of generalExpenses) {
    allItems.push({
      id: e.id,
      category: "OPERATIONAL",
      categoryLabel: "Operational Expense",
      title: `${e.category}: ${e.paidTo || "Vendor Payment"}`,
      description: e.notes || "Fleet hub operational expense",
      entityName: e.paidTo || "Head Office",
      entityType: "OFFICE",
      driverId: null,
      driverName: "HQ Admin / Management",
      driverCode: "HQ-OPS",
      vehicleNumber: null,
      amount: Number(e.amount),
      date: e.expenseDate,
      paymentMode: e.paymentMode,
      status: "APPROVED",
    });
  }

  for (const v of vehicleExpenses) {
    const vDriver = v.trip?.driver || v.vehicle.trips[0]?.driver;
    allItems.push({
      id: v.id,
      category: "VEHICLE_EXPENSE",
      categoryLabel: "Vehicle Running Cost",
      title: v.expenseType.replace(/_/g, " "),
      description: v.description || "Vehicle toll / telemetry subscription",
      entityName: v.vehicle.vehicleNumber,
      entityType: "VEHICLE",
      driverId: vDriver?.id || null,
      driverName: vDriver?.user?.name || "Fleet Vehicle Account",
      driverCode: vDriver?.driverCode || null,
      vehicleNumber: v.vehicle.vehicleNumber,
      amount: Number(v.amount),
      date: v.expenseDate,
      paymentMode: "FASTAG",
      status: "APPROVED",
    });
  }

  for (const t of tripExpenses) {
    allItems.push({
      id: t.id,
      category: "TRIP_TOLL",
      categoryLabel: "Toll & Highway Tax",
      title: t.expenseType.replace(/_/g, " "),
      description: t.notes || "Trip route commercial border entry tax",
      entityName: t.trip.tripNumber,
      entityType: "TRIP",
      driverId: t.trip.driver.id,
      driverName: t.trip.driver.user.name,
      driverCode: t.trip.driver.driverCode,
      vehicleNumber: t.trip.vehicle.vehicleNumber,
      amount: Number(t.amount),
      date: t.createdAt,
      paymentMode: t.paidBy,
      status: "APPROVED",
    });
  }

  for (const d of driverExpenses) {
    allItems.push({
      id: d.id,
      category: "DRIVER_CLAIM",
      categoryLabel: "Driver Road Claim",
      title: `${d.category} Road Expense`,
      description: d.notes || "Driver road expense reimbursement",
      entityName: d.driver.user.name,
      entityType: "DRIVER",
      driverId: d.driver.id,
      driverName: d.driver.user.name,
      driverCode: d.driver.driverCode,
      vehicleNumber: d.trip?.vehicle?.vehicleNumber || null,
      amount: Number(d.amount),
      date: d.date,
      paymentMode: "CASH",
      status: "APPROVED",
    });
  }

  // Sort by date descending
  allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter by category
  let filtered = allItems;
  if (category && category !== "ALL") {
    if (category === "MAINTENANCE") filtered = allItems.filter(i => i.category === "MAINTENANCE");
    else if (category === "FUEL") filtered = allItems.filter(i => i.category === "FUEL");
    else if (category === "DRIVER_PAYMENT") filtered = allItems.filter(i => i.category === "DRIVER_PAYMENT");
    else if (category === "DRIVER_ADVANCE") filtered = allItems.filter(i => i.category === "DRIVER_ADVANCE");
    else if (category === "OPERATIONAL") filtered = allItems.filter(i => ["OPERATIONAL", "VEHICLE_EXPENSE", "TRIP_TOLL", "DRIVER_CLAIM"].includes(i.category));
  }

  // Filter by driver
  if (driverId && driverId !== "ALL") {
    if (driverId === "HQ") {
      filtered = filtered.filter(i => !i.driverId);
    } else {
      filtered = filtered.filter(i => i.driverId === driverId);
    }
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.entityName.toLowerCase().includes(q) ||
      i.driverName.toLowerCase().includes(q) ||
      (i.driverCode && i.driverCode.toLowerCase().includes(q)) ||
      (i.vehicleNumber && i.vehicleNumber.toLowerCase().includes(q)) ||
      i.categoryLabel.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const skip = (page - 1) * limit;
  const items = filtered.slice(skip, skip + limit);

  return {
    items,
    totals: {
      grandTotal,
      maintenanceTotal,
      fuelTotal,
      driverPaymentsTotal,
      driverAdvancesTotal,
      operationalTotal,
    },
    counts: {
      all: allItems.length,
      maintenance: maintenance.length,
      fuel: fuel.length,
      driverPayments: driverPayments.length,
      driverAdvances: driverAdvances.length,
      operational: generalExpenses.length + vehicleExpenses.length + tripExpenses.length + driverExpenses.length,
    },
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

// ─── Company Master Financial Ledger (Credits vs Debits) ─────────────────────

export async function getMasterCompanyLedger(params: { page?: number; limit?: number }) {
  const { page = 1, limit = 50 } = params;
  const skip = (page - 1) * limit;

  const [transactions, total, creditAgg, debitAgg] = await Promise.all([
    prisma.transaction.findMany({
      skip,
      take: limit,
      orderBy: { date: "desc" },
    }),
    prisma.transaction.count(),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "CREDIT" },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "DEBIT" },
    }),
  ]);

  return {
    transactions,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    totalCredit: Number(creditAgg._sum.amount ?? 0),
    totalDebit: Number(debitAgg._sum.amount ?? 0),
    netBalance: Number(creditAgg._sum.amount ?? 0) - Number(debitAgg._sum.amount ?? 0),
  };
}

// ─── Driver Ledger ────────────────────────────────────────────────────────────

export async function getDriverLedger(driverId: string, params: { page?: number; limit?: number }) {
  const { page = 1, limit = 30 } = params;
  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    prisma.driverLedger.findMany({
      where: { driverId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.driverLedger.count({ where: { driverId } }),
  ]);

  return { entries, total, page, totalPages: Math.ceil(total / limit) };
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export async function getAttendance(params: {
  driverId?: string;
  date?: Date;
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
}) {
  const { driverId, date, month, year, page = 1, limit = 50 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (driverId) where.driverId = driverId;
  if (date) where.date = date;
  if (month !== undefined && year !== undefined) {
    const from = new Date(year, month, 1);
    const to = new Date(year, month + 1, 0);
    where.date = { gte: from, lte: to };
  }

  const [records, total] = await Promise.all([
    prisma.driverAttendance.findMany({
      where,
      skip,
      take: limit,
      include: { driver: { include: { user: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.driverAttendance.count({ where }),
  ]);

  return { records, total, page, totalPages: Math.ceil(total / limit) };
}

// ─── Fuel Management ─────────────────────────────────────────────────────────

export async function getFuelRecords(params: {
  vehicleId?: string;
  driverId?: string;
  page?: number;
  limit?: number;
}) {
  const { vehicleId, driverId, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (vehicleId) where.vehicleId = vehicleId;
  if (driverId) where.driverId = driverId;

  const [records, total] = await Promise.all([
    prisma.vehicleFuel.findMany({
      where,
      skip,
      take: limit,
      include: {
        vehicle: true,
        driver: { include: { user: true } },
        trip: true,
      },
      orderBy: { fuelDate: "desc" },
    }),
    prisma.vehicleFuel.count({ where }),
  ]);

  return { records, total, page, totalPages: Math.ceil(total / limit) };
}

export async function createFuelRecord(data: {
  vehicleId: string;
  driverId?: string;
  tripId?: string;
  fuelDate: Date;
  quantityLiters: number;
  ratePerLiter: number;
  totalAmount: number;
  fuelStation?: string;
  odometerReading?: number;
}) {
  return prisma.vehicleFuel.create({ data: data as Parameters<typeof prisma.vehicleFuel.create>[0]["data"] });
}

// ─── Maintenance ──────────────────────────────────────────────────────────────

export async function getMaintenanceRecords(params: { vehicleId?: string; page?: number; limit?: number }) {
  const { vehicleId, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (vehicleId) where.vehicleId = vehicleId;

  const [records, total] = await Promise.all([
    prisma.vehicleMaintenance.findMany({
      where,
      skip,
      take: limit,
      include: { vehicle: true },
      orderBy: { serviceDate: "desc" },
    }),
    prisma.vehicleMaintenance.count({ where }),
  ]);

  return { records, total, page, totalPages: Math.ceil(total / limit) };
}

export async function createMaintenanceRecord(data: {
  vehicleId: string;
  serviceDate: Date;
  serviceType: string;
  cost: number;
  odometerReading?: number;
  workshopName?: string;
  invoiceNumber?: string;
  description?: string;
}) {
  return prisma.vehicleMaintenance.create({ data: data as Parameters<typeof prisma.vehicleMaintenance.create>[0]["data"] });
}

// ─── User Management ──────────────────────────────────────────────────────────

export async function getUsers(params: { search?: string; role?: string; page?: number; limit?: number }) {
  const { search = "", role, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deletedAt: null };
  if (role && role !== "ALL") where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      include: { driverProfile: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, totalPages: Math.ceil(total / limit) };
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications(userId: string, limit = 30) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markNotificationRead(id: string) {
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export async function getAuditLogsAdmin(params: {
  userId?: string;
  entity?: string;
  action?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}) {
  const { userId, entity, action, dateFrom, dateTo, page = 1, limit = 50 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;
  if (entity) where.entity = entity;
  if (action) where.action = { contains: action };
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) (where.createdAt as Record<string, unknown>).gte = dateFrom;
    if (dateTo) (where.createdAt as Record<string, unknown>).lte = dateTo;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, totalPages: Math.ceil(total / limit) };
}

export async function createAuditLog(data: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  return prisma.auditLog.create({
    data: {
      action: data.action,
      entity: data.entity,
      entityId: data.entityId ?? null,
      userId: data.userId ?? null,
      oldValue: data.oldValue ? (data.oldValue as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      newValue: data.newValue ? (data.newValue as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
    },
  });
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(group?: string) {
  return prisma.setting.findMany({
    where: group ? { group } : undefined,
    orderBy: { key: "asc" },
  });
}

export async function upsertSetting(key: string, value: string, group = "GENERAL", description?: string) {
  return prisma.setting.upsert({
    where: { key },
    update: { value, group, description },
    create: { key, value, group, description },
  });
}

// ─── Helpers for dropdowns ────────────────────────────────────────────────────

export async function getAllVehiclesForSelect() {
  const list = await prisma.vehicle.findMany({
    where: { deletedAt: null, status: { not: "INACTIVE" } },
    select: { id: true, vehicleNumber: true, vehicleType: true, status: true },
    orderBy: { vehicleNumber: "asc" },
  });
  return JSON.parse(JSON.stringify(list));
}

export async function getAllDriversForSelect() {
  const list = await prisma.driver.findMany({
    where: { deletedAt: null, status: { not: "INACTIVE" } },
    select: { id: true, driverCode: true, perOrderRate: true, user: { select: { name: true, phone: true } } },
    orderBy: { driverCode: "asc" },
  });
  return JSON.parse(JSON.stringify(list));
}

export async function getAllDpdsForSelect() {
  const list = await prisma.dpd.findMany({
    where: { isActive: true },
    select: { id: true, code: true, name: true, city: true, ratePerOrderDefault: true },
    orderBy: { name: "asc" },
  });
  return JSON.parse(JSON.stringify(list));
}

// ─── Report data helpers ──────────────────────────────────────────────────────

export async function getReportTrips(dateFrom: Date, dateTo: Date) {
  return prisma.trip.findMany({
    where: { tripDate: { gte: dateFrom, lte: dateTo }, deletedAt: null },
    include: {
      vehicle: true,
      driver: { include: { user: true } },
      dpd: true,
      driverAdvances: true,
      driverExpenses: { where: { status: "APPROVED" } },
    },
    orderBy: { tripDate: "asc" },
  });
}

export async function getDriverPerformanceReport(dateFrom: Date, dateTo: Date) {
  const drivers = await prisma.driver.findMany({
    where: { deletedAt: null },
    include: {
      user: true,
      trips: {
        where: { tripDate: { gte: dateFrom, lte: dateTo }, deletedAt: null },
        select: { totalOrders: true, deliveredOrders: true, perOrderRate: true },
      },
    },
  });

  return drivers.map(d => ({
    driverId: d.id,
    driverCode: d.driverCode,
    name: d.user.name,
    totalTrips: d.trips.length,
    totalOrders: d.trips.reduce((s, t) => s + t.totalOrders, 0),
    deliveredOrders: d.trips.reduce((s, t) => s + t.deliveredOrders, 0),
    grossEarnings: d.trips.reduce((s, t) => s + (t.deliveredOrders * Number(t.perOrderRate)), 0),
  }));
}
