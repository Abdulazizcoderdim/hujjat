"use client";

import { useToast } from "@/hooks/use-toast";
import { authStore } from "@/store/auth.store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { setIsAuth, setLoading, setUser } = authStore();
  const isRequestSent = useRef(false);
  const [mounted, setMounted] = useState(false);

  // 1. Client ID ni tekshiramiz
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // 2. Hydration muammosini oldini olish uchun
  useEffect(() => {
    setMounted(true);
  }, []);

  // 3. Auth tekshiruvi (Sizning eski AuthInitializer kodingiz)
  useEffect(() => {
    const checkAuth = async () => {
      if (isRequestSent.current) return;

      const token = localStorage.getItem("USER_ACCESS_TOKEN");
      if (!token) {
        setLoading(false);
        return;
      }

      isRequestSent.current = true;
      try {
        setLoading(true);
        const { data } = await axios.post(
          "/api/auth/refresh",
          {},
          {
            withCredentials: true,
          },
        );
        localStorage.setItem("USER_ACCESS_TOKEN", data.accessToken);
        setIsAuth(true);
        setUser(data.user);
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("USER_ACCESS_TOKEN");
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setIsAuth, setLoading, setUser]);

  // Agar Client ID bo'lmasa, dastur qulamasligi uchun shunchaki bolalarini qaytaramiz
  // Lekin Google Login ishlamaydi
  if (!clientId) {
    console.error("DIQQAT: NEXT_PUBLIC_GOOGLE_CLIENT_ID topilmadi!");
    return <>{children}</>;
  }

  // Sahifa to'liq yuklanmaguncha kutamiz (Hydration fix)
  if (!mounted) {
    return null;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
  );
}
