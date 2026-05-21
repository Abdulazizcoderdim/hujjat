import {
  EntButton,
  EntCard,
  EntField,
  EntInput,
} from "@/components/enterprise";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { authStore } from "@/store/auth.store";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsAuth, setUser } = authStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await $api.post("/auth/login", { email, password });
      localStorage.setItem("ADMIN_ACCESS_TOKEN", data.accessToken);
      setUser(data.user);
      setIsAuth(true);
      navigate("/");
      toast({ title: "Tizimga kirdingiz" });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Login yoki parol noto'g'ri";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="ent-scope"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--ent-bg)",
        padding: 20,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ width: 360 }}>
        {/* Brand */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            marginBottom: 14,
          }}
        >
          <img
            src="/favicon.svg"
            alt="OTU"
            style={{
              width: 48,
              height: 48,
              display: "block",
            }}
          />
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--ent-accent)",
              letterSpacing: 0.5,
              textAlign: "center",
            }}
          >
            OTU · KUTUBXONA ADMIN
          </div>
          <div
            className="ent-muted"
            style={{ fontSize: 11, textAlign: "center" }}
          >
            Boshqaruv paneliga kirish
          </div>
        </div>

        <EntCard title="Tizimga kirish">
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            {error && (
              <div
                style={{
                  border: "1px solid var(--ent-danger)",
                  background: "var(--ent-danger-bg)",
                  color: "var(--ent-danger)",
                  fontSize: 11,
                  padding: "6px 8px",
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <AlertCircle size={12} />
                {error}
              </div>
            )}
            <EntField label="Foydalanuvchi nomi" htmlFor="login" required>
              <EntInput
                id="login"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
            </EntField>
            <EntField label="Parol" htmlFor="pass" required>
              <EntInput
                id="pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </EntField>
            <EntButton
              type="submit"
              variant="primary"
              disabled={loading}
              style={{ width: "100%", marginTop: 4, height: 32 }}
            >
              {loading ? "Tekshirilmoqda..." : "Kirish"}
            </EntButton>
          </form>
        </EntCard>

        <div
          style={{
            textAlign: "center",
            fontSize: 10,
            color: "var(--ent-text-faint)",
            marginTop: 14,
          }}
        >
          © {new Date().getFullYear()} Osiyo Texnologiyalar Universiteti
        </div>
      </div>
    </div>
  );
}
