import {
  EntBadge,
  EntButton,
  EntPage,
  EntTable,
  EntTableWrap,
  EntToolbar,
} from "@/components/enterprise";
import { fetchOperators } from "@/service/operator";
import { useQuery } from "@tanstack/react-query";
import { Activity, RefreshCw, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const fmtDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function MonitoringPage() {
  const navigate = useNavigate();
  const { data: operators = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["operators-monitoring"],
    queryFn: fetchOperators,
  });

  return (
    <EntPage>
      <EntToolbar
        title="Operatorlar monitoringi"
        actions={
          <>
            <EntButton onClick={() => refetch()}>
              <RefreshCw size={14} /> Yangilash
            </EntButton>
            <EntButton
              variant="primary"
              onClick={() => navigate("/users/admins?tab=operator&new=1")}
            >
              <UserPlus size={14} /> Operator qo'shish
            </EntButton>
          </>
        }
      />

      <div style={{ padding: 6 }} className="ent-stack-y">
        <div className="ent-muted" style={{ fontSize: 12, padding: "2px 4px" }}>
          {isFetching && "yuklanmoqda..."}
          {!isLoading && operators.length > 0 && (
            <>Jami {operators.length} ta operator</>
          )}
        </div>

        <EntTableWrap>
          <EntTable>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>FIO</th>
                <th style={{ width: 220 }}>Email / Login</th>
                <th style={{ width: 90 }}>Holat</th>
                <th style={{ width: 90 }}>Jami</th>
                <th style={{ width: 90 }}>7 kun</th>
                <th style={{ width: 90 }}>30 kun</th>
                <th style={{ width: 150 }}>So'nggi login</th>
                <th style={{ width: 90 }}>Amal</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="ent-empty">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : operators.length === 0 ? (
                <tr>
                  <td colSpan={9} className="ent-empty">
                    Hali operator qo'shilmagan.{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/users/admins?tab=operator&new=1");
                      }}
                      style={{ color: "var(--ent-accent)" }}
                    >
                      Yangi operator qo'shish
                    </a>
                  </td>
                </tr>
              ) : (
                operators.map((o, idx) => (
                  <tr key={o.id}>
                    <td className="ent-cell--num ent-muted">{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {o.full_name || "—"}
                      </div>
                      {o.phone && (
                        <div className="ent-muted" style={{ fontSize: 11 }}>
                          {o.phone}
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{o.email || "—"}</div>
                      {o.login && (
                        <div className="ent-muted" style={{ fontSize: 11 }}>
                          {o.login}
                        </div>
                      )}
                    </td>
                    <td>
                      {o.is_blocked ? (
                        <EntBadge variant="danger">Bloklangan</EntBadge>
                      ) : o.is_active ? (
                        <EntBadge variant="success">Faol</EntBadge>
                      ) : (
                        <EntBadge variant="muted">Nofaol</EntBadge>
                      )}
                    </td>
                    <td className="ent-cell--num" style={{ fontWeight: 600 }}>
                      {o.uploadedTotal}
                    </td>
                    <td className="ent-cell--num">{o.uploaded7Days}</td>
                    <td className="ent-cell--num">{o.uploaded30Days}</td>
                    <td className="ent-cell--code ent-muted">
                      {fmtDateTime(o.lastLoginAt)}
                    </td>
                    <td>
                      <EntButton
                        size="xs"
                        onClick={() => navigate(`/monitoring/${o.id}`)}
                      >
                        <Activity size={11} /> Tafsilot
                      </EntButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </EntTable>
        </EntTableWrap>
      </div>
    </EntPage>
  );
}

export default MonitoringPage;
