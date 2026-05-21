import { EntButton, EntCard } from "@/components/enterprise";
import { Home } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.warn("404:", location.pathname);
  }, [location.pathname]);

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
      }}
    >
      <div style={{ width: 360 }}>
        <EntCard title="Sahifa topilmadi">
          <div style={{ textAlign: "center", padding: "16px 8px" }}>
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: "var(--ent-text-faint)",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              404
            </div>
            <div style={{ fontSize: 13, marginTop: 8, marginBottom: 12 }}>
              So'ralgan sahifa mavjud emas
            </div>
            <div
              className="ent-muted ent-cell--code"
              style={{
                fontSize: 11,
                marginBottom: 16,
                wordBreak: "break-all",
                background: "var(--ent-bg)",
                border: "1px solid var(--ent-border)",
                padding: "4px 6px",
              }}
            >
              {location.pathname}
            </div>
            <EntButton
              variant="primary"
              onClick={() => navigate("/")}
              style={{ height: 32 }}
            >
              <Home size={14} /> Bosh sahifaga
            </EntButton>
          </div>
        </EntCard>
      </div>
    </div>
  );
};

export default NotFound;
