import $api from "@/http/axios";
import { authStore } from "@/store/auth.store";
import { motion } from "framer-motion";
import { ArrowRight, Lock, User, BookOpen, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const StatCard = ({ icon: Icon, label, value, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[120px]"
  >
    <Icon className="text-blue-200 mb-2" size={24} />
    <span className="text-2xl font-bold text-white">
      {value.toLocaleString()}
    </span>
    <span className="text-[10px] text-blue-200 uppercase tracking-wider font-medium">
      {label}
    </span>
  </motion.div>
);

const Login = () => {
  const navigate = useNavigate();
  const { setIsAuth, setUser, setLoading } = authStore();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await $api.get("/auth/login-stats");
        setStats(data);
      } catch (err) {
        console.error("Stats error", err);
      }
    };
    fetchStats();
  }, []);

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
      localStorage.setItem("access_token", data.accessToken);
      navigate("/");
    } catch (error) {
      toast.error("Login yoki parol noto'g'ri.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-slate-50 overflow-hidden font-sans">
      <div className="hidden lg:flex w-1/2 relative bg-[#0052FF] items-center justify-center p-8 overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 w-full max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 inline-block"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2.5rem] shadow-2xl">
              <img
                src="/otuwhitelogo.png"
                alt="OTU Logo"
                className="h-24 w-auto object-contain mx-auto"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">
              OTU Kutubxonasi
            </h1>
            <p className="text-blue-100 text-lg font-light mb-10 opacity-80">
              Raqamli bilimlar maskaniga xush kelibsiz
            </p>

            {/* Statistika Grid */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <StatCard
                icon={BookOpen}
                label="Kitoblar"
                value={stats?.totalBooks || 0}
                delay={0.3}
              />
              <StatCard
                icon={Users}
                label="Talabalar"
                value={stats?.students?.total || 0}
                delay={0.4}
              />
              {/* <StatCard
                icon={GraduationCap}
                label="Bakalavr"
                value={stats?.students?.bakalavr || 0}
                delay={0.5}
              /> */}
              {/* <StatCard
                icon={MapPin}
                label="Regionlar"
                value={stats?.regionsCount || 14}
                delay={0.6}
              /> */}
            </div>

            {stats && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 max-w-md mx-auto"
              >
                <div className="flex justify-between text-xs text-blue-200 mb-2 uppercase tracking-tighter">
                  <span>Ayol: {stats.students.ayollar}</span>
                  <span>Erkak: {stats.students.erkaklar}</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-pink-400"
                    style={{
                      width: `${(stats.students.ayollar / stats.students.total) * 100}%`,
                    }}
                  />
                  <div
                    className="h-full bg-blue-300"
                    style={{
                      width: `${(stats.students.erkaklar / stats.students.total) * 100}%`,
                    }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src="/favicon.svg" className="w-16 h-16 mb-2" alt="Logo" />
            <h1 className="text-2xl font-bold text-slate-900">
              OTU Kutubxonasi
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Kirish</h2>
            <p className="text-slate-500">
              Tizimga kirish uchun Hemis ID ma'lumotlaringizdan foydalaning.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Talaba ID
              </label>
              <div className="relative group">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="2401001..."
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Parol
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  size={20}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              disabled={authLoading}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {authLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Tizimga kirish"
              )}
              {!authLoading && <ArrowRight size={20} />}
            </button>
          </form>

          <p className="mt-12 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} Osiyo Texnologiyalar Universiteti
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
