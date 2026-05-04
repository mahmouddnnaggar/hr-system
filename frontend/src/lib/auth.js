export const AUTH_STORAGE_KEY = "evalsystem:auth";

export const USER_ROLES = {
  ADMIN: "ADMIN",
  HR: "HR",
  EMPLOYEE: "EMPLOYEE",
};

export const USER_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

export const ROLE_HOME_PATHS = {
  [USER_ROLES.ADMIN]: "/admin/dashboard",
  [USER_ROLES.HR]: "/hr/dashboard",
  [USER_ROLES.EMPLOYEE]: "/employee/dashboard",
};

export function isKnownRole(role) {
  return Object.prototype.hasOwnProperty.call(ROLE_HOME_PATHS, role);
}

export function normalizeAuthUser(user) {
  if (!user || typeof user !== "object" || !isKnownRole(user.role)) {
    return null;
  }

  return user;
}

export function getDashboardPath(userOrRole) {
  const role = typeof userOrRole === "string" ? userOrRole : userOrRole?.role;
  return ROLE_HOME_PATHS[role] || "/login";
}

function isSafeInternalPath(path) {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && path !== "/login";
}

export function getPostLoginPath(from, role) {
  const dashboardPath = getDashboardPath(role);

  if (!isSafeInternalPath(from)) {
    return dashboardPath;
  }

  if (role === USER_ROLES.ADMIN && !from.startsWith("/admin/")) {
    return dashboardPath;
  }

  if (role === USER_ROLES.HR && (from.startsWith("/employee/") || from.startsWith("/admin/"))) {
    return dashboardPath;
  }

  if (role === USER_ROLES.EMPLOYEE && (from.startsWith("/hr/") || from.startsWith("/admin/"))) {
    return dashboardPath;
  }

  return from;
}
