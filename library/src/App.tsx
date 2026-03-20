import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import BookReader from "./components/BookReader.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import $api from "./http/axios.ts";
import { UserRole } from "./interface/index.ts";
import BookDetail from "./pages/BookDetail.tsx";
import Faculty from "./pages/Faculty.tsx";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import MyBooks from "./pages/MyBooks.tsx";
import NotFound from "./pages/NotFound.tsx";
import Products from "./pages/Products.tsx";
import Profile from "./pages/Profile.tsx";
import Saved from "./pages/Saved.tsx";
import { authStore } from "./store/auth.store.ts";

const queryClient = new QueryClient();

const App = () => {
  const { setIsAuth, setLoading, setUser, isLoading } = authStore();

  const checkAuth = async () => {
    try {
      setLoading(true);
      const { data } = await $api.get("/auth/me");

      if (data.user.role !== UserRole.STUDENT) {
        throw new Error("Siz student emassiz!");
      }

      setIsAuth(true);
      setUser(data.user);
    } catch (error) {
      localStorage.removeItem("access_token");
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route
              path="/my-books"
              element={
                <ProtectedRoute>
                  <MyBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book/:id/read"
              element={
                <ProtectedRoute>
                  <BookReader />
                </ProtectedRoute>
              }
            />
            <Route
              path="/category/:slug"
              element={
                <ProtectedRoute>
                  <Faculty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <Saved />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book/:id"
              element={
                <ProtectedRoute>
                  <BookDetail />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
