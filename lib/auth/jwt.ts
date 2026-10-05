import { SignJWT, jwtVerify } from "jose";
import { UserSession } from "./types";

const JWT_SECRET_STRING =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "rapone_tms_jwt_auth_secret_key_minimum_32_characters_long_for_security";

const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);
const TOKEN_EXPIRY = "7d";
const TOKEN_ISSUER = "rapone-tms";
const TOKEN_AUDIENCE = "rapone-users";

export const SESSION_COOKIE_NAME = "rapone_tms_session";

/**
 * Signs a secure JWT containing user session information
 */
export async function signSessionToken(session: UserSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(SECRET_KEY);
}

/**
 * Verifies a JWT session token and returns the decoded session
 */
export async function verifySessionToken(
  token: string
): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });

    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      phone: (payload.phone as string) || null,
      role: payload.role as UserSession["role"],
      driverId: (payload.driverId as string) || null,
      avatarUrl: (payload.avatarUrl as string) || null,
    };
  } catch {
    return null;
  }
}
