"use client";

import { useToast } from "@/hooks/use-toast";
import { authStore } from "@/store/auth.store";
import axios from "axios";
import { useEffect, useRef } from "react";

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const { setIsAuth, setLoading, setUser } = authStore();

  // 🛑 So'rov 2 marta ketmasligi uchun himoya
  const isRequestSent = useRef(false);

  const checkAuth = async () => {
    if (isRequestSent.current) return; // Agar so'rov ketgan bo'lsa, to'xtatadi
    isRequestSent.current = true;

    try {
      setLoading(true);
      const { data } = await axios.post("/api/auth/refresh");
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

  useEffect(() => {
    if (localStorage.getItem("USER_ACCESS_TOKEN")) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  return <>{children}</>;
}
