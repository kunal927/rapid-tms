export type Role = "SUPER_ADMIN" | "OPERATIONS_MANAGER" | "DRIVER";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: Role;
  driverId?: string | null;
  avatarUrl?: string | null;
}

export interface AuthResult {
  success: boolean;
  user?: UserSession;
  redirectUrl?: string;
  error?: string;
}
