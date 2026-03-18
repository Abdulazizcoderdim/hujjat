import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, User, Lock, ExternalLink } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: navigate to home
    navigate("/");
  };

  const handleHemisLogin = () => {
    // Placeholder for Hemis integration
    window.open("https://hemis.ai", "_blank");
  };

  return (
    <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
      {/* Left - Branding */}
      <div className="hidden lg:flex w-1/2 bg-primary flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-primary-foreground/30" />
          <div className="absolute bottom-32 right-16 w-96 h-96 rounded-full border border-primary-foreground/20" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full border border-primary-foreground/10" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
            <GraduationCap className="w-10 h-10 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground font-display tracking-tight mb-3">
            Osiyo Texnologiyalar Universiteti
          </h1>
          <p className="text-lg text-primary-foreground/80 font-display">
            Axborot Kutubxonasi
          </p>
          <div className="mt-8 pt-8 border-t border-primary-foreground/10">
            <p className="text-sm text-primary-foreground/60">
              12,482 ta kitob • 34 ta yangi qo'shildi
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary font-display">OTU Kutubxonasi</h1>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold font-display tracking-tight">Tizimga kirish</h2>
            <p className="text-sm text-muted-foreground mt-2">Talaba ID va parolingizni kiriting</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block font-mono-label">
                Talaba ID
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Masalan: 2401001"
                  className="w-full h-12 bg-card border-2 border-border rounded-xl pl-11 pr-4 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block font-mono-label">
                Parol
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parolingizni kiriting"
                  className="w-full h-12 bg-card border-2 border-border rounded-xl pl-11 pr-4 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Kirish
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">yoki</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Hemis Login */}
          <button
            onClick={handleHemisLogin}
            className="w-full h-12 bg-card border-2 border-border rounded-xl font-semibold text-sm text-foreground hover:bg-secondary active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
            Hemis orqali kirish
          </button>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Parolni unutdingizmi?{" "}
            <button className="text-primary font-medium hover:underline">
              Qayta tiklash
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
