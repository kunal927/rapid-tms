import { Role } from "../auth/types";

export type Permission =
  // Trip permissions
  | "trips:view_all"
  | "trips:view_assigned"
  | "trips:create"
  | "trips:update"
  | "trips:assign_driver"
  | "trips:delete"
  | "trips:update_status"
  // Vehicle permissions
  | "vehicles:view_all"
  | "vehicles:create"
  | "vehicles:update"
  | "vehicles:maintenance"
  | "vehicles:fuel_log"
  // Driver permissions
  | "drivers:view_all"
  | "drivers:create"
  | "drivers:update"
  | "drivers:view_own_profile"
  // Order & Delivery permissions
  | "orders:view_all"
  | "orders:view_assigned"
  | "orders:create"
  | "orders:update_status"
  | "pod:upload"
  | "pod:verify"
  // Financial & Expense permissions
  | "advances:request_own"
  | "advances:view_all"
  | "advances:approve"
  | "expenses:submit_own"
  | "expenses:view_all"
  | "expenses:approve"
  | "ledger:view_all"
  | "ledger:view_own"
  | "payouts:calculate"
  | "payouts:approve"
  // User & System administration
  | "users:manage"
  | "settings:manage"
  | "audit:view"
  | "excel:import_export";

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: [
    "trips:view_all",
    "trips:view_assigned",
    "trips:create",
    "trips:update",
    "trips:assign_driver",
    "trips:delete",
    "trips:update_status",
    "vehicles:view_all",
    "vehicles:create",
    "vehicles:update",
    "vehicles:maintenance",
    "vehicles:fuel_log",
    "drivers:view_all",
    "drivers:create",
    "drivers:update",
    "drivers:view_own_profile",
    "orders:view_all",
    "orders:view_assigned",
    "orders:create",
    "orders:update_status",
    "pod:upload",
    "pod:verify",
    "advances:request_own",
    "advances:view_all",
    "advances:approve",
    "expenses:submit_own",
    "expenses:view_all",
    "expenses:approve",
    "ledger:view_all",
    "ledger:view_own",
    "payouts:calculate",
    "payouts:approve",
    "users:manage",
    "settings:manage",
    "audit:view",
    "excel:import_export",
  ],

  OPERATIONS_MANAGER: [
    "trips:view_all",
    "trips:view_assigned",
    "trips:create",
    "trips:update",
    "trips:assign_driver",
    "trips:update_status",
    "vehicles:view_all",
    "vehicles:update",
    "vehicles:maintenance",
    "vehicles:fuel_log",
    "drivers:view_all",
    "drivers:update",
    "orders:view_all",
    "orders:view_assigned",
    "orders:create",
    "orders:update_status",
    "pod:upload",
    "pod:verify",
    "advances:view_all",
    "expenses:view_all",
    "expenses:approve",
    "excel:import_export",
  ],

  DRIVER: [
    "trips:view_assigned",
    "trips:update_status",
    "drivers:view_own_profile",
    "orders:view_assigned",
    "orders:update_status",
    "pod:upload",
    "advances:request_own",
    "expenses:submit_own",
    "ledger:view_own",
  ],
};

/**
 * Checks whether a given role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Returns the default dashboard URL for a user role
 */
export function getRoleRedirectUrl(role: Role): string {
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

/**
 * Checks whether a role is authorized to view another user's operational data
 */
export function canAccessDriverData(
  userRole: Role,
  currentUserId: string,
  targetDriverUserId: string
): boolean {
  if (userRole === "SUPER_ADMIN" || userRole === "OPERATIONS_MANAGER") {
    return true;
  }
  return currentUserId === targetDriverUserId;
}
