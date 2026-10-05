import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a bcrypt hash
 */
export async function verifyPassword(
  plainText: string,
  hashed: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plainText, hashed);
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}
