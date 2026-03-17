import { UserRole } from "@/interface";
import { authStore } from "@/store/auth.store";
import { Navigate } from "react-router-dom";

export const RoleProtectedRoute = ({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}) => {
  const { user } = authStore();

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/products/pending" replace />;
  }

  return children;
};
