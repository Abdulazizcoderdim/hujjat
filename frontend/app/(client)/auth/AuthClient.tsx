"use client";

import $api from "@/http/axios";
import { IUser } from "@/interface";
import { authStore } from "@/store/auth.store";
import { Eye, EyeOff, Lock, LogIn, User } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface Response {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

const AuthClient = () => {
  const router = useRouter();
  const { setIsAuth, setUser, isAuth, setLoading } = authStore();
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [form, setForm] = useState({
    login: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLoginSuccess = () => {
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { data } = await $api.post<Response>("/auth/hemis/login", {
        login: form.login,
        password: form.password,
      });

      setUser(data.user);
      setIsAuth(true);
      setLoading(true);
      handleLoginSuccess();
    } catch (error) {
      console.log(error);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center py-12 px-4 bg-slate-50 min-h-screen">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl sm:p-10 p-8 border border-slate-200">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
              <LogIn className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Tizimga kirish
            </h1>
            <p className="text-slate-500 mt-2 text-sm">Talaba axborot tizimi</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Talaba ID (Login)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  name="login"
                  value={form.login}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="ID raqamingizni kiriting"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">
                  Parol
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Tizimga kirish"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default AuthClient;
