import { authStore } from "@/store/auth.store";
import { Loader } from "lucide-react";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuth, isLoading } = authStore();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="">
          <Loader className="animate-spin" size={50} />
        </div>
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
