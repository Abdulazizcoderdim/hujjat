import {
  EntBadge,
  EntButton,
  EntFilterBar,
  EntFilterField,
  EntInput,
  EntPage,
  EntPagination,
  EntTable,
  EntTableWrap,
  EntToolbar,
} from "@/components/enterprise";
import { useDebounce } from "@/hooks/use-debounce";
import $api from "@/http/axios";
import { IPagination, IUser } from "@/interface";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Users } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LIMIT = 25;

interface EmployeesResponse {
  items: IUser[];
  pagination: IPagination;
}

/** Hodimlar — HEMIS'dan sync qilinadi (faqat o'qish uchun).
 *  Ular saytga kirmaydi; kutubxonachi qarz berishda ro'yxatdan tanlaydi. */
export function EmployeesPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const pageParam = Number(params.get("page") ?? 1);
  const page = Number.isInteger(pageParam) && pageParam >= 1 ? pageParam : 1;
  const debounced = useDebounce(search, 350);

  const setParam = (k: string, v: string | number | null) => {
    const next = new URLSearchParams(params);
    if (v === null || v === "") next.delete(k);
    else next.set(k, String(v));
    if (k !== "page") next.delete("page");
    setParams(next, { replace: true });
  };

  const filters = useMemo(
    () => ({ search: debounced, page }),
    [debounced, page],
  );

  const { data, isLoading, isFetching, refetch } = useQuery<EmployeesResponse>({
    queryKey: ["employees", filters],
    queryFn: async () => {
      const res = await $api.get("/users/role/employee", {
        params: { search: filters.search, page: filters.page, limit: LIMIT },
      });
      return res.data;
    },
    placeholderData: (p) => p,
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <EntPage>
      <EntToolbar
        title="Hodimlar"
        actions={
          <>
            <EntButton onClick={() => refetch()}>
              <RefreshCw size={14} /> Yangilash
            </EntButton>
            <EntButton
              variant="primary"
              onClick={() => navigate("/users/sync")}
              title="HEMIS'dan hodimlarni sinxronlash"
            >
              <Users size={14} /> HEMIS sinxronizatsiya
            </EntButton>
          </>
        }
      />

      <EntFilterBar>
        <EntFilterField label="Qidiruv">
          <EntInput
            value={search}
            onChange={(e) => setParam("search", e.target.value)}
            placeholder="FIO, xodim raqami, lavozim yoki bo'lim"
            style={{ width: 320 }}
          />
        </EntFilterField>
        <div style={{ marginLeft: "auto" }} className="ent-muted">
          {isFetching
            ? "yuklanmoqda..."
            : pagination
              ? `Jami ${pagination.total} ta hodim`
              : ""}
        </div>
      </EntFilterBar>

      <EntTableWrap style={{ flex: 1, minHeight: 0 }}>
        <EntTable>
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th style={{ width: 44 }}></th>
              <th>FIO</th>
              <th style={{ width: 130 }}>Xodim raqami</th>
              <th style={{ width: 200 }}>Lavozim</th>
              <th style={{ width: 240 }}>Bo'lim / kafedra</th>
              <th style={{ width: 90 }}>Holat</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="ent-empty">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="ent-empty">
                  {debounced
                    ? "Hodim topilmadi"
                    : "Hodimlar hali sinxronlanmagan — HEMIS sinxronizatsiya sahifasida \"Hodimlarni sinxronlash\" tugmasini bosing"}
                </td>
              </tr>
            ) : (
              items.map((u, idx) => (
                <tr key={u.id}>
                  <td className="ent-cell--num ent-muted">
                    {(page - 1) * LIMIT + idx + 1}
                  </td>
                  <td>
                    {u.image ? (
                      <img
                        src={u.image}
                        alt=""
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "1px solid var(--ent-border)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "var(--ent-bg)",
                          border: "1px solid var(--ent-border)",
                        }}
                      />
                    )}
                  </td>
                  <td style={{ fontWeight: 500 }}>{u.full_name || "—"}</td>
                  <td className="ent-cell--code">
                    {u.employee_id_number || (
                      <span className="ent-muted">—</span>
                    )}
                  </td>
                  <td className="ent-muted">{u.position || "—"}</td>
                  <td className="ent-muted">{u.department || "—"}</td>
                  <td>
                    {u.is_active ? (
                      <EntBadge variant="success">Faol</EntBadge>
                    ) : (
                      <EntBadge variant="muted">Bo'shagan</EntBadge>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </EntTable>
      </EntTableWrap>

      {pagination && (
        <EntPagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={LIMIT}
          onChange={(p) => setParam("page", p)}
        />
      )}
    </EntPage>
  );
}

export default EmployeesPage;
