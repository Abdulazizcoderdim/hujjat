import $api from "@/http/axios";
import { authStore } from "@/store/auth.store";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Lock, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { setIsAuth, setUser, setLoading } = authStore();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { data } = await $api.post("/auth/hemis/login", {
        login: studentId,
        password: password,
      });

      setUser(data.user);
      setIsAuth(true);
      setLoading(true);
      localStorage.setItem("access_token", data.accessToken);
      navigate("/");
    } catch (error) {
      console.log(error);
    } finally {
      setAuthLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-slate-50 overflow-hidden font-sans">
      <div className="hidden lg:flex w-1/2 relative bg-[#0052FF] items-center justify-center p-12 overflow-hidden">
        {/* Animated Background Ornaments */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 w-full max-w-lg text-center">
          {/* Main Illustration Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative mb-12"
          >
            {/* Glass Card for Logo */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-20 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] shadow-2xl"
            >
              <img
                src="/logo.png"
                alt="University Logo"
                className="w-full h-auto max-h-64 object-contain drop-shadow-2xl"
              />
            </motion.div>

            {/* Decorative element behind the image */}
            <div className="absolute inset-0 bg-blue-600/30 blur-2xl rounded-full scale-75 -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
              Osiyo Texnologiyalar Universiteti
            </h1>
            <p className="text-blue-100 text-xl font-light mb-8">
              Axborot-kutubxona tizimiga xush kelibsiz
            </p>

            <div className="flex items-center justify-center gap-6 py-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">12,482+</p>
                <p className="text-xs text-blue-200 uppercase tracking-widest">
                  Kitoblar
                </p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">5,000+</p>
                <p className="text-xs text-blue-200 uppercase tracking-widest">
                  Talabalar
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Header */}
          <div className="lg:hidden flex flex-col items-center sm:mb-10 text-center">
            <div className="w-10 h-10">
              <img src="/favicon.svg" alt="" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              OTU Kutubxonasi
            </h1>
          </div>

          <div className="sm:mb-10 mb-5">
            <h2 className="sm:text-3xl text-2xl font-bold text-slate-900 mb-2 text-center">
              Kirish
            </h2>
            <p className="text-slate-500 text-center">
              Davom etish uchun Hemis ID ma'lumotlaringizni kiriting
            </p>
          </div>

          <form onSubmit={handleSubmit} className="sm:space-y-6 space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Talaba ID
              </label>
              <div className="group relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-blue-600 text-slate-400">
                  <User size={20} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  value={studentId}
                  required
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Masalan: 2401001"
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-slate-900 transition-all focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Parol
              </label>
              <div className="group relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-blue-600 text-slate-400">
                  <Lock size={20} strokeWidth={2} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-slate-900 transition-all focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={authLoading}
              type="submit"
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 group"
            >
              <AnimatePresence mode="wait">
                {authLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"
                  />
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    Tizimga kirish
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} Osiyo Texnologiyalar Universiteti.{" "}
            <br />
            Barcha huquqlar himoyalangan.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
