import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createAuditLog } from "@/lib/db/admin-service";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["SUPER_ADMIN", "OPERATIONS_MANAGER"]);
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
        { user: { name: { contains: search } } },
        { user: { phone: { contains: search } } },
        { licenseNumber: { contains: search } },
        { driverCode: { contains: search } },
      ];
    }

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where, skip, take: limit,
        include: { user: true, _count: { select: { trips: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.driver.count({ where }),
    ]);

    return NextResponse.json({ drivers, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["SUPER_ADMIN"]);
    const body = await req.json();
    const { name, email, phone, password, driverCode, licenseNumber, licenseExpiry, aadharNumber, panNumber, emergencyContact, perOrderRate, dateOfJoining } = body;

    if (!name?.trim() || !email?.trim() || !driverCode?.trim() || !licenseNumber?.trim()) {
      return NextResponse.json({ message: "Name, email, driver code and license number are required" }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existingUser) return NextResponse.json({ message: "Email already in use" }, { status: 409 });

    const existingDriver = await prisma.driver.findUnique({ where: { licenseNumber: licenseNumber.trim() } });
    if (existingDriver) return NextResponse.json({ message: "License number already registered" }, { status: 409 });

    const existingCode = await prisma.driver.findUnique({ where: { driverCode: driverCode.trim().toUpperCase() } });
    if (existingCode) return NextResponse.json({ message: "Driver code already in use" }, { status: 409 });

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        passwordHash,
        role: "DRIVER",
        driverProfile: {
          create: {
            driverCode: driverCode.trim().toUpperCase(),
            licenseNumber: licenseNumber.trim().toUpperCase(),
            licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
            aadharNumber: aadharNumber?.trim() || null,
            panNumber: panNumber?.trim() || null,
            emergencyContact: emergencyContact?.trim() || null,
            perOrderRate: perOrderRate ? parseFloat(perOrderRate) : 35,
            dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : new Date(),
          },
        },
      },
      include: { driverProfile: true },
    });

    await createAuditLog({
      userId: session.id,
      action: "CREATE_DRIVER",
      entity: "Driver",
      entityId: user.driverProfile?.id,
      newValue: { name, email, driverCode },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("Create driver error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
