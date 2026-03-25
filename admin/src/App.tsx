import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import {
  ApprovedProductsPage,
  RejectedProductsPage,
} from "@/pages/admin/products";
import { SettingsPage } from "@/pages/admin/SettingsPage";
import { LoginPage } from "@/pages/LoginPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CategoriesPage } from "./components/admin/category/CategoriesPage";
import { ThemeProvider } from "./components/theme-provider";
import $api from "./http/axios";
import { UserRole } from "./interface";
import { AdminsPage } from "./pages/admin/users/AdminsPage";
import { StudentsTable } from "./pages/admin/users/StudentsTable";
import NotFound from "./pages/NotFound";
import UploadProductsPage from "./pages/UploadProductsPage";
import { authStore } from "./store/auth.store";
import StudentStats from "./pages/StudentStats";

const queryClient = new QueryClient();

const App = () => {
  const { setIsAuth, setLoading, setUser, isLoading } = authStore();

  const checkAuth = async () => {
    try {
      setLoading(true);
      const { data } = await $api.get("/auth/me");

      if (data.user.role !== UserRole.ADMIN) {
        throw new Error("Siz admin emassiz!");
      }

      setIsAuth(true);
      setUser(data.user);
    } catch (error) {
      localStorage.removeItem("ADMIN_ACCESS_TOKEN");
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("ADMIN_ACCESS_TOKEN");
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader className="animate-spin w-10 h-10" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/users/admins" element={<AdminsPage />} />
                <Route path="/users/students" element={<StudentsTable />} />
                <Route path="/students/:id/stats" element={<StudentStats />} />
                <Route path="/categories" element={<CategoriesPage />} />

                <Route
                  path="/products/upload"
                  element={<UploadProductsPage />}
                />
                <Route
                  path="/products/approved"
                  element={<ApprovedProductsPage />}
                />
                <Route
                  path="/products/rejected"
                  element={<RejectedProductsPage />}
                />

                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
