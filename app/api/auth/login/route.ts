import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import { authenticateUser } from "@/lib/db/service";
import { setSessionCookie } from "@/lib/auth/session";
import { getRoleRedirectUrl } from "@/lib/permissions/rbac";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.issues?.[0]?.message || "Invalid input data",
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password. Please try again.",
        },
        { status: 401 }
      );
    }

    // Set secure HTTP-only session cookie
    await setSessionCookie(user);

    const redirectUrl = getRoleRedirectUrl(user.role);

    return NextResponse.json({
      success: true,
      user,
      redirectUrl,
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected authentication error occurred.",
      },
      { status: 500 }
    );
  }
}
