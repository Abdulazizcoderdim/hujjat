import {
  EntBadge,
  EntButton,
  EntDialog,
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
import { IUser, UserRole } from "@/interface";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LIMIT_DEFAULT = 25;

const formatDate = (iso?: string | Date) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function StudentsTable() {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 350);
  const [page, setPage] = useState(1);
  const [limit] = useState(LIMIT_DEFAULT);
  const [selected, setSelected] = useState<IUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setPage(1);
  }, [debounced]);

  const studentsQ = useQuery({
    queryKey: ["students", { debounced, page, limit }],
    queryFn: async () => {
      const params = {
        role: UserRole.STUDENT,
        search: debounced,
        page,
        limit,
      };
      const res = await $api.get(`/users/role/${UserRole.STUDENT}`, { params });
      return res.data;
    },
  });

  const items: IUser[] = studentsQ.data?.items ?? [];
  const pagination = studentsQ.data?.pagination;

  return (
    <EntPage>
      <EntToolbar
        title="Talabalar"
        actions={
          <EntButton onClick={() => studentsQ.refetch()}>↻ Yangilash</EntButton>
        }
      />

      <EntFilterBar>
        <EntFilterField label="Qidiruv">
          <EntInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="FIO yoki talabalik raqami"
            style={{ width: 280 }}
          />
        </EntFilterField>
        <div style={{ marginLeft: "auto" }} className="ent-muted">
          {studentsQ.isFetching && "yuklanmoqda..."}
        </div>
      </EntFilterBar>

      <EntTableWrap style={{ flex: 1, minHeight: 0 }}>
        <EntTable>
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th>FIO</th>
              <th style={{ width: 130 }}>Talaba ID</th>
              <th style={{ width: 220 }}>Universitet / Fakultet</th>
              <th style={{ width: 110 }}>Guruh</th>
              <th style={{ width: 70 }}>Kurs</th>
              <th style={{ width: 90 }}>Holat</th>
              <th style={{ width: 100 }}>Sana</th>
              <th style={{ width: 90 }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {studentsQ.isLoading ? (
              <tr>
                <td colSpan={9} className="ent-empty">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9} className="ent-empty">
                  Talaba topilmadi
                </td>
              </tr>
            ) : (
              items.map((u, idx) => (
                <tr key={u.id}>
                  <td className="ent-cell--num ent-muted">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>
                      {u.full_name ||
                        `${u.first_name ?? ""} ${u.second_name ?? ""}`.trim()}
                    </div>
                    <div
                      className="ent-muted"
                      style={{ fontSize: 11 }}
                    >
                      {u.email || u.login || ""}
                    </div>
                  </td>
                  <td className="ent-cell--code">
                    {u.student_id_number || (
                      <span className="ent-muted">—</span>
                    )}
                  </td>
                  <td>
                    <div
                      style={{
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={`${u.university ?? ""} · ${u.faculty ?? ""}`}
                    >
                      {u.university || "—"}
                      <div
                        className="ent-muted"
                        style={{
                          fontSize: 11,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {u.faculty || "—"}
                      </div>
                    </div>
                  </td>
                  <td className="ent-muted">{u.group || "—"}</td>
                  <td className="ent-muted">{u.level || "—"}</td>
                  <td>
                    {u.is_active ? (
                      <EntBadge variant="success">Faol</EntBadge>
                    ) : (
                      <EntBadge variant="danger">Bloklangan</EntBadge>
                    )}
                  </td>
                  <td className="ent-cell--code ent-muted">
                    {formatDate(u.createdAt)}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <EntButton
                        size="icon"
                        title="Batafsil"
                        onClick={() => setSelected(u)}
                      >
                        <Eye size={14} />
                      </EntButton>
                      <EntButton
                        size="icon"
                        title="Statistika"
                        onClick={() =>
                          navigate(`/students/${u.id}/stats`, {
                            state: {
                              studentName:
                                u.full_name ||
                                `${u.first_name ?? ""} ${u.second_name ?? ""}`.trim(),
                            },
                          })
                        }
                      >
                        <BarChart2 size={14} />
                      </EntButton>
                    </div>
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
          limit={limit}
          onChange={setPage}
        />
      )}

      <EntDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Talaba ma'lumotlari"
        width={640}
        footer={
          <EntButton onClick={() => setSelected(null)}>Yopish</EntButton>
        }
      >
        {selected && (
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12 }}>
            {/* Photo */}
            <div>
              {selected.image ? (
                <img
                  src={selected.image}
                  alt=""
                  style={{
                    width: 120,
                    height: 150,
                    objectFit: "cover",
                    border: "1px solid var(--ent-border)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 120,
                    height: 150,
                    border: "1px solid var(--ent-border)",
                    background: "var(--ent-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--ent-text-faint)",
                    fontSize: 11,
                  }}
                >
                  Rasm yo'q
                </div>
              )}
              <div style={{ marginTop: 6 }}>
                {selected.is_active ? (
                  <EntBadge variant="success">Faol</EntBadge>
                ) : (
                  <EntBadge variant="danger">Bloklangan</EntBadge>
                )}
              </div>
            </div>

            {/* Fields */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: "4px 8px",
                fontSize: 12,
                alignItems: "baseline",
              }}
            >
              <div className="ent-muted">FIO:</div>
              <div style={{ fontWeight: 600 }}>{selected.full_name || "—"}</div>

              <div className="ent-muted">Talaba ID:</div>
              <div className="ent-cell--code">
                {selected.student_id_number || "—"}
              </div>

              <div className="ent-muted">Email/Login:</div>
              <div>{selected.email || selected.login || "—"}</div>

              <div className="ent-muted">Telefon:</div>
              <div className="ent-cell--code">{selected.phone || "—"}</div>

              <div className="ent-muted">Universitet:</div>
              <div>{selected.university || "—"}</div>

              <div className="ent-muted">Fakultet:</div>
              <div>{selected.faculty || "—"}</div>

              <div className="ent-muted">Mutaxassislik:</div>
              <div>{selected.specialty || "—"}</div>

              <div className="ent-muted">Guruh:</div>
              <div>{selected.group || "—"}</div>

              <div className="ent-muted">Kurs / Semestr:</div>
              <div>
                {selected.level || "—"}-kurs / {selected.semester || "—"}-semestr
              </div>

              <div className="ent-muted">Tug'ilgan sana:</div>
              <div className="ent-cell--code">
                {selected.birth_date
                  ? new Date(Number(selected.birth_date)).toLocaleDateString(
                      "uz-UZ",
                    )
                  : "—"}
              </div>

              <div className="ent-muted">Manzil:</div>
              <div>{selected.address || "—"}</div>

              <div className="ent-muted">Ro'yxatdan o'tgan:</div>
              <div className="ent-cell--code">{formatDate(selected.createdAt)}</div>
            </div>
          </div>
        )}
      </EntDialog>
    </EntPage>
  );
}
