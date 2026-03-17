import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import {
  ApprovedProductsPage,
  PendingProductsPage,
  RejectedProductsPage,
} from "@/pages/admin/products";
import { SettingsPage } from "@/pages/admin/SettingsPage";
import { AdminsPage } from "@/pages/admin/users/AdminsPage";
import { LoginPage } from "@/pages/LoginPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CategoriesPage } from "./components/admin/category/CategoriesPage";
import { ThemeProvider } from "./components/theme-provider";
import { useToast } from "./hooks/use-toast";
import $api from "./http/axios";
import { UserRole } from "./interface";
import { StudentsTable } from "./pages/admin/users/SellerTable";
import NotFound from "./pages/NotFound";
import { authStore } from "./store/auth.store";

const queryClient = new QueryClient();

const App = () => {
  const { toast } = useToast();
  const { setIsAuth, setLoading, setUser, isLoading } = authStore();

  const checkAuth = async () => {
    try {
      setLoading(true);
      const { data } = await $api.post("/auth/refresh");
      if (
        data.user.role !== UserRole.ADMIN &&
        data.user.role !== UserRole.MODERATOR
      ) {
        localStorage.removeItem("ADMIN_ACCESS_TOKEN");
        return;
      }

      localStorage.setItem("ADMIN_ACCESS_TOKEN", data.accessToken);
      setIsAuth(true);
      setUser(data.user);
    } catch (error) {
      toast({
        title: error?.response?.data?.message || "Xatolik!",
        description: "Iltimoms qaytadan urinib ko'ring!",
      });
      localStorage.removeItem("ADMIN_ACCESS_TOKEN");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("ADMIN_ACCESS_TOKEN")) {
      checkAuth();
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
                <Route
                  path="/products/pending"
                  element={<PendingProductsPage />}
                />
                <Route path="/categories" element={<CategoriesPage />} />
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
