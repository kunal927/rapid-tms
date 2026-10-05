import { prisma, isDatabaseConnected } from "./prisma";
import { verifyPassword } from "../auth/password";
import { UserSession, Role } from "../auth/types";
import {
  SEED_USERS,
  SEED_TRIPS,
  SEED_VEHICLES,
  SEED_DRIVERS,
  SEED_ORDERS,
  SEED_AUDIT_LOGS,
  SeedTrip,
  SeedOrder,
  SeedAuditLog,
} from "./seed-data";

// Mutable in-memory store for fallback/demo mode when MySQL is offline
const inMemoryTrips: SeedTrip[] = [...SEED_TRIPS];
const inMemoryOrders: SeedOrder[] = [...SEED_ORDERS];
const inMemoryAuditLogs: SeedAuditLog[] = [...SEED_AUDIT_LOGS];

let dbConnectionCache: boolean | null = null;
let lastDbCheck = 0;

async function checkDatabaseLive(): Promise<boolean> {
  const now = Date.now();
  if (dbConnectionCache !== null && now - lastDbCheck < 10000) {
    return dbConnectionCache;
  }
  lastDbCheck = now;
  dbConnectionCache = await isDatabaseConnected();
  return dbConnectionCache;
}

export async function isDatabaseLive(): Promise<boolean> {
  return checkDatabaseLive();
}

/**
 * Authenticates user credentials via Prisma MySQL or resilient fallback
 */
export async function authenticateUser(
  email: string,
  plainPassword: string
): Promise<UserSession | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const dbLive = await checkDatabaseLive();

  if (dbLive) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { driverProfile: true },
      });

      if (!user || !user.isActive) return null;

      const isValid = await verifyPassword(plainPassword, user.passwordHash);
      if (!isValid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role as Role,
        driverId: user.driverProfile?.id || null,
        avatarUrl: user.avatarUrl,
      };
    } catch (err) {
      console.warn("Prisma auth failed, falling back to local store:", err);
    }
  }

  // Resilient fallback logic
  const seedUser = SEED_USERS.find(
    (u) => u.email.toLowerCase() === normalizedEmail
  );
  if (!seedUser) return null;

  const isValid = await verifyPassword(plainPassword, seedUser.passwordHash);
  if (!isValid) return null;

  return {
    id: seedUser.id,
    email: seedUser.email,
    name: seedUser.name,
    phone: seedUser.phone,
    role: seedUser.role,
    driverId: seedUser.driverId || null,
    avatarUrl: seedUser.avatarUrl,
  };
}

/**
 * Retrieves trips based on user role and permissions
 */
export async function getTrips(options?: {
  role?: Role;
  userId?: string;
  driverId?: string;
}): Promise<SeedTrip[]> {
  const dbLive = await checkDatabaseLive();

  if (dbLive) {
    try {
      const whereClause: Record<string, unknown> = {};
      if (options?.role === "DRIVER" && options?.driverId) {
        whereClause.driverId = options.driverId;
      }

      const trips = await prisma.trip.findMany({
        where: whereClause,
        include: {
          vehicle: true,
          driver: { include: { user: true } },
          dpd: true,
        },
        orderBy: { tripDate: "desc" },
      });

      if (trips.length > 0) {
        return trips.map((t) => ({
          id: t.id,
          tripNumber: t.tripNumber,
          tripDate: t.tripDate.toISOString().split("T")[0],
          vehicleId: t.vehicleId,
          vehicleNumber: t.vehicle.vehicleNumber,
          driverId: t.driverId,
          driverName: t.driver.user.name,
          dpdId: t.dpdId,
          dpdName: t.dpd.name,
          totalOrders: t.totalOrders,
          deliveredOrders: t.deliveredOrders,
          failedOrders: t.failedOrders,
          pendingOrders: Math.max(
            0,
            t.totalOrders - t.deliveredOrders - t.failedOrders
          ),
          perOrderRate: Number(t.perOrderRate),
          dpdAdvance: Number(t.dpdAdvance),
          driverAdvance: Number(t.driverAdvance),
          driverPayment: Number(t.deliveredOrders) * Number(t.perOrderRate),
          status: t.status as SeedTrip["status"],
          startKm: t.startKm ?? undefined,
          endKm: t.endKm ?? undefined,
        }));
      }
    } catch (err) {
      console.warn("Prisma trip fetch failed, using fallback:", err);
    }
  }

  // Filter in-memory trips
  if (options?.role === "DRIVER" && options?.driverId) {
    return inMemoryTrips.filter((t) => t.driverId === options.driverId);
  }
  return inMemoryTrips;
}

/**
 * Retrieves orders assigned to a specific trip
 */
export async function getTripOrders(tripId: string): Promise<SeedOrder[]> {
  const dbLive = await checkDatabaseLive();

  if (dbLive) {
    try {
      const orders = await prisma.order.findMany({
        where: { tripId },
        orderBy: { orderNumber: "asc" },
      });

      if (orders.length > 0) {
        return orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          tripId: o.tripId || tripId,
          recipientName: o.recipientName,
          recipientPhone: o.recipientPhone,
          deliveryAddress: o.deliveryAddress,
          city: o.city,
          pincode: o.pincode,
          codAmount: Number(o.codAmount),
          paymentType: o.paymentType as "PREPAID" | "COD",
          status: o.status as SeedOrder["status"],
        }));
      }
    } catch (err) {
      console.warn("Prisma order fetch failed, using fallback:", err);
    }
  }

  return inMemoryOrders.filter((o) => o.tripId === tripId);
}

/**
 * Updates order delivery status and logs audit entry
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: SeedOrder["status"],
  remarks?: string,
  updaterName?: string
): Promise<boolean> {
  const dbLive = await checkDatabaseLive();

  if (dbLive) {
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus as any },
      });

      await prisma.auditLog.create({
        data: {
          action: "UPDATE_ORDER_STATUS",
          entity: "Order",
          entityId: orderId,
          newValue: { status: newStatus, remarks },
        },
      });
      return true;
    } catch (err) {
      console.warn("Prisma order update failed, using fallback:", err);
    }
  }

  // In-memory update
  const order = inMemoryOrders.find((o) => o.id === orderId);
  if (order) {
    order.status = newStatus;
    if (remarks) order.remarks = remarks;

    // Also update parent trip counts
    const parentTrip = inMemoryTrips.find((t) => t.id === order.tripId);
    if (parentTrip) {
      if (newStatus === "DELIVERED") {
        parentTrip.deliveredOrders += 1;
        parentTrip.driverPayment =
          parentTrip.deliveredOrders * parentTrip.perOrderRate;
      } else if (newStatus === "FAILED") {
        parentTrip.failedOrders += 1;
      }
      parentTrip.pendingOrders = Math.max(
        0,
        parentTrip.totalOrders -
          parentTrip.deliveredOrders -
          parentTrip.failedOrders
      );
    }

    inMemoryAuditLogs.unshift({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      userName: updaterName || "Driver",
      role: "DRIVER",
      action: "UPDATE_STATUS",
      entity: "Order",
      entityId: order.orderNumber,
      details: `Status changed to ${newStatus}. ${remarks || ""}`,
    });

    return true;
  }

  return false;
}

/**
 * Calculates operational and financial metrics for dashboard summaries
 */
export async function getDashboardMetrics(role: Role, driverId?: string) {
  const trips = await getTrips(
    role === "DRIVER" && driverId ? { role, driverId } : undefined
  );

  const totalTrips = trips.length;
  const runningTrips = trips.filter((t) => t.status === "RUNNING").length;
  const completedTrips = trips.filter((t) => t.status === "COMPLETED").length;
  const totalOrders = trips.reduce((sum, t) => sum + t.totalOrders, 0);
  const deliveredOrders = trips.reduce((sum, t) => sum + t.deliveredOrders, 0);
  const failedOrders = trips.reduce((sum, t) => sum + t.failedOrders, 0);

  // Financial aggregates
  const totalDriverAdvances = trips.reduce((sum, t) => sum + t.driverAdvance, 0);
  const totalDpdAdvances = trips.reduce((sum, t) => sum + t.dpdAdvance, 0);
  const totalDriverPayments = trips.reduce((sum, t) => sum + t.driverPayment, 0);
  const deliverySuccessRate =
    totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

  return {
    totalTrips,
    runningTrips,
    completedTrips,
    totalOrders,
    deliveredOrders,
    failedOrders,
    totalDriverAdvances,
    totalDpdAdvances,
    totalDriverPayments,
    deliverySuccessRate,
    activeFleetCount: SEED_VEHICLES.filter((v) => v.status === "ON_TRIP").length,
    totalFleetCount: SEED_VEHICLES.length,
    activeDriversCount: SEED_DRIVERS.filter((d) => d.status === "ON_TRIP").length,
  };
}

export async function getAuditLogs(): Promise<SeedAuditLog[]> {
  return inMemoryAuditLogs;
}
