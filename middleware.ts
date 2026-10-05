import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "rapone_tms_jwt_auth_secret_key_minimum_32_characters_long_for_security";

const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);
const SESSION_COOKIE_NAME = "rapone_tms_session";

interface DecodedToken {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "OPERATIONS_MANAGER" | "DRIVER";
}

async function getSessionFromRequest(
  request: NextRequest
): Promise<DecodedToken | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      issuer: "rapone-tms",
      audience: "rapone-users",
    });

    return {
      id: payload.id as string,
      email: payload.email as string,
      role: payload.role as DecodedToken["role"],
    };
  } catch {
    return null;
  }
}

function getRoleRedirect(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/admin/dashboard";
    case "OPERATIONS_MANAGER":
      return "/operations/dashboard";
    case "DRIVER":
      return "/driver/dashboard";
    default:
      return "/login";
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  // If user is already logged in and visits /login or root /, redirect to their role dashboard
  if (pathname === "/login" || pathname === "/") {
    if (session) {
      return NextResponse.redirect(new URL(getRoleRedirect(session.role), request.url));
    }
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Admin route protection: Super Admin only
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL(getRoleRedirect(session.role), request.url));
    }
  }

  // Operations route protection: Operations Manager or Super Admin
  if (pathname.startsWith("/operations")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "OPERATIONS_MANAGER" && session.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL(getRoleRedirect(session.role), request.url));
    }
  }

  // Driver route protection: Driver only
  if (pathname.startsWith("/driver")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "DRIVER") {
      return NextResponse.redirect(new URL(getRoleRedirect(session.role), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/admin/:path*",
    "/operations/:path*",
    "/driver/:path*",
  ],
};
