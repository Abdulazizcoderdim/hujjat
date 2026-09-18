import { authStore } from "@/store/auth.store";
import { Loader } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuth, isLoading } = authStore();
  const location = useLocation();

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
    // Login'dan keyin foydalanuvchi kirmoqchi bo'lgan sahifaga qaytarish uchun
    // (masalan, QR skanerlab kelgan talaba to'g'ri kitobga tushsin).
    const returnTo = location.pathname + location.search;
    const target =
      returnTo && returnTo !== "/"
        ? `/login?returnTo=${encodeURIComponent(returnTo)}`
        : "/login";
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}
