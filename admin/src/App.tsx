import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { RoleProtected } from "@/components/admin/RoleProtected";
import { EntAppLayout } from "@/components/enterprise/layout";
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
import { SyncPage } from "./pages/admin/users/SyncPage";
import { CatalogPage } from "./pages/admin/library/CatalogPage";
import { LoansPage } from "./pages/admin/library/LoansPage";
import { QuickReturnPage } from "./pages/admin/library/QuickReturnPage";
import { AuditOverviewPage } from "./pages/admin/audit/AuditOverviewPage";
import { LoginsPage as AuditLoginsPage } from "./pages/admin/audit/LoginsPage";
import { SessionsPage as AuditSessionsPage } from "./pages/admin/audit/SessionsPage";
import { ActionsPage as AuditActionsPage } from "./pages/admin/audit/ActionsPage";
import { RequestsPage } from "./pages/admin/requests/RequestsPage";
import { MyUploadsPage } from "./pages/admin/operator/MyUploadsPage";
import { MonitoringPage } from "./pages/admin/monitoring/MonitoringPage";
import { OperatorDetailPage } from "./pages/admin/monitoring/OperatorDetailPage";
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

      if (
        data.user.role !== UserRole.ADMIN &&
        data.user.role !== UserRole.OPERATOR
      ) {
        throw new Error("Sizda admin panelga kirish huquqi yo'q");
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
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <EntAppLayout />
                  </ProtectedRoute>
                }
              >
                {/* Admin-only routes */}
                <Route
                  path="/"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <DashboardPage />
                    </RoleProtected>
                  }
                />
                <Route
                  path="/users/admins"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <AdminsPage />
                    </RoleProtected>
                  }
                />
                <Route
                  path="/users/students"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <StudentsTable />
                    </RoleProtected>
                  }
                />
                <Route
                  path="/users/sync"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <SyncPage />
                    </RoleProtected>
                  }
                />
                <Route
                  path="/students/:id/stats"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <StudentStats />
                    </RoleProtected>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <CategoriesPage />
                    </RoleProtected>
                  }
                />
                <Route
                  path="/requests"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <RequestsPage />
                    </RoleProtected>
                  }
                />

                {/* Shared (admin + operator) */}
                <Route
                  path="/products/upload"
                  element={
                    <RoleProtected
                      roles={[UserRole.ADMIN, UserRole.OPERATOR]}
                    >
                      <UploadProductsPage />
                    </RoleProtected>
                  }
                />
                <Route
                  path="/products/my-uploads"
                  element={
                    <RoleProtected
                      roles={[UserRole.ADMIN, UserRole.OPERATOR]}
                    >
                      <MyUploadsPage />
                    </RoleProtected>
                  }
                />

                {/* Admin-only resources */}
                <Route
                  path="/products/approved"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <ApprovedProductsPage />
                    </RoleProtected>
                  }
                />
                <Route
                  path="/products/rejected"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <RejectedProductsPage />
                    </RoleProtected>
                  }
                />

                <Route
                  path="/library/catalog"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <CatalogPage />
                    </RoleProtected>
                  }
                />
                <Route
                  path="/library/loans"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <LoansPage />
                    </RoleProtected>
                  }
                />
                <Route
                  path="/library/return"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <QuickReturnPage />
                    </RoleProtected>
                  }
                />

                <Route
                  path="/audit"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <AuditOverviewPage />
                    </RoleProtected>
                  }
                />
                <Route
                  path="/audit/logins"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <AuditLoginsPage />
                    </RoleProtected>
                  }
                />
                <Route
                  path="/audit/sessions"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <AuditSessionsPage />
                    </RoleProtected>
                  }
                />
                <Route
                  path="/audit/actions"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <AuditActionsPage />
                    </RoleProtected>
                  }
                />

                <Route
                  path="/monitoring"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <MonitoringPage />
                    </RoleProtected>
                  }
                />
                <Route
                  path="/monitoring/:id"
                  element={
                    <RoleProtected roles={[UserRole.ADMIN]}>
                      <OperatorDetailPage />
                    </RoleProtected>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <RoleProtected
                      roles={[UserRole.ADMIN, UserRole.OPERATOR]}
                    >
                      <SettingsPage />
                    </RoleProtected>
                  }
                />
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
