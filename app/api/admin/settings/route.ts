import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getSettings, upsertSetting } from "@/lib/db/admin-service";

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  try {
    const settings = await getSettings(searchParams.get("group") ?? undefined);
    return NextResponse.json(settings);
  } catch (err: any) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "SUPER_ADMIN") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const { key, value, group, description } = await req.json();
    if (!key) return NextResponse.json({ message: "Key is required" }, { status: 400 });
    const setting = await upsertSetting(key, value ?? "", group, description);
    return NextResponse.json(setting);
  } catch (err: any) { return NextResponse.json({ message: err.message }, { status: 500 }); }
}
