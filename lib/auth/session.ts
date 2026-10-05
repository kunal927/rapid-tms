import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken, signSessionToken } from "./jwt";
import { UserSession, Role } from "./types";
import { redirect } from "next/navigation";
import { getRoleRedirectUrl } from "../permissions/rbac";

/**
 * Retrieves the current authenticated user session from HTTP-only cookie
 */
export async function getCurrentSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    return await verifySessionToken(token);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") {
      throw error;
    }
    console.error("Failed to get current session:", error);
    return null;
  }
}

/**
 * Sets the session cookie in the response
 */
export async function setSessionCookie(session: UserSession): Promise<string> {
  const token = await signSessionToken(session);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return token;
}

/**
 * Clears the session cookie on logout
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Enforces authentication and authorization on Server Components / Pages
 */
export async function requireAuth(allowedRoles?: Role[]): Promise<UserSession> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    // Redirect to their designated role dashboard if they try to access unauthorized panel
    redirect(getRoleRedirectUrl(session.role));
  }

  return session;
}
