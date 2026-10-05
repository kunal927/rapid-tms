import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/db/admin-service";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(["SUPER_ADMIN", "OPERATIONS_MANAGER"]);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
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
      prisma.vehicle.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.vehicle.count({ where }),
    ]);

    return NextResponse.json({ vehicles, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["SUPER_ADMIN"]);
    const body = await req.json();

    const { vehicleNumber, vehicleType, make, model, year, ownershipType, capacityTons, insuranceExpiry, fitnessExpiry, permitExpiry, pollutionExpiry } = body;

    if (!vehicleNumber?.trim() || !vehicleType?.trim()) {
      return NextResponse.json({ message: "Vehicle number and type are required" }, { status: 400 });
    }

    const existing = await prisma.vehicle.findUnique({ where: { vehicleNumber: vehicleNumber.trim().toUpperCase() } });
    if (existing) {
      return NextResponse.json({ message: "Vehicle number already exists" }, { status: 409 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        vehicleType: vehicleType.trim(),
        make: make?.trim() || null,
        model: model?.trim() || null,
        year: year ? parseInt(year) : null,
        ownershipType: ownershipType ?? "OWNED",
        capacityTons: capacityTons ? parseFloat(capacityTons) : null,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
        fitnessExpiry: fitnessExpiry ? new Date(fitnessExpiry) : null,
        permitExpiry: permitExpiry ? new Date(permitExpiry) : null,
        pollutionExpiry: pollutionExpiry ? new Date(pollutionExpiry) : null,
      },
    });

    await createAuditLog({
      userId: session.id,
      action: "CREATE_VEHICLE",
      entity: "Vehicle",
      entityId: vehicle.id,
      newValue: { vehicleNumber: vehicle.vehicleNumber },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (err: unknown) {
    console.error("Create vehicle error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
