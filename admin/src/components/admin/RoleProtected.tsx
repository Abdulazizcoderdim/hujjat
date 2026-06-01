import { UserRole } from "@/interface";
import { authStore } from "@/store/auth.store";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

/**
 * Restrict children to specific roles. If the current user's role is not in `roles`,
 * redirect to `fallback` (default — operator goes to /products/upload).
 */
export function RoleProtected({
  children,
  roles,
  fallback,
}: {
  children: ReactNode;
  roles: UserRole[];
  fallback?: string;
}) {
  const { user } = authStore();
  const role = (user?.role as UserRole) || undefined;
  if (!role) return <Navigate to="/login" replace />;
  if (!roles.includes(role)) {
    const target =
      fallback ?? (role === UserRole.OPERATOR ? "/products/upload" : "/");
    return <Navigate to={target} replace />;
  }
  return <>{children}</>;
}
