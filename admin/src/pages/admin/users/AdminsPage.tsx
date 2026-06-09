import {
  EntBadge,
  EntButton,
  EntConfirmDialog,
  EntDrawer,
  EntField,
  EntFilterBar,
  EntFilterField,
  EntInput,
  EntPage,
  EntPagination,
  EntTab,
  EntTabs,
  EntTable,
  EntTableWrap,
  EntToolbar,
} from "@/components/enterprise";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { IPagination, IUser, UserRole } from "@/interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

interface BuyerResponse {
  items: IUser[];
  pagination: IPagination;
}

const LIMIT_DEFAULT = 25;

const fmtDate = (iso?: string | Date) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

type TabKey = "admin" | "operator";

export function AdminsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as TabKey) === "operator" ? "operator" : "admin";
  const role = tab === "operator" ? UserRole.OPERATOR : UserRole.ADMIN;

  const [page, setPage] = useState(1);
  const [limit] = useState(LIMIT_DEFAULT);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 350);

  const [editing, setEditing] = useState<IUser | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    full_name: "",
    email: "",
    login: "",
    phone: "",
    password: "",
  });

  const [confirmDel, setConfirmDel] = useState<IUser | null>(null);

  useEffect(() => {
    setPage(1);
  }, [debounced, tab]);

  useEffect(() => {
    setSearch("");
  }, [tab]);

  useEffect(() => {
    setEditing(null);
    setConfirmDel(null);
  }, [tab]);

  useEffect(() => {
    if (params.get("new") === "1") {
      setAdding(true);
      const p = new URLSearchParams(params);
      p.delete("new");
      setParams(p, { replace: true });
    }
  }, [params, setParams]);

  useEffect(() => {
    if (editing) {
      setEditForm({
        full_name: editing.full_name || "",
        email: editing.email || "",
        phone: editing.phone || "",
        password: "",
      });
    }
  }, [editing]);

  const setTab = (next: TabKey) => {
    const p = new URLSearchParams(params);
    if (next === "admin") p.delete("tab");
    else p.set("tab", next);
    setParams(p, { replace: true });
  };

  const queryKey = ["role-users", role, { page, debounced, limit }] as const;

  const { data, isLoading, isFetching } = useQuery<BuyerResponse>({
    queryKey,
    queryFn: async () => {
      const reqParams = { page, limit, search: debounced };
      const res = await $api.get(`/users/role/${role}`, { params: reqParams });
      return res.data;
    },
    placeholderData: (prev) =>
      prev ?? {
        items: [],
        pagination: { total: 0, page: 1, limit, totalPages: 1 },
      },
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const createEndpoint =
    role === UserRole.OPERATOR ? "/users/create-operator" : "/users/create-admin";

  const addMu = useMutation({
    mutationFn: (payload: typeof addForm) => $api.post(createEndpoint, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["role-users"] });
      toast({
        title:
          role === UserRole.OPERATOR ? "Operator yaratildi" : "Admin yaratildi",
      });
      setAdding(false);
      setAddForm({
        full_name: "",
        email: "",
        login: "",
        phone: "",
        password: "",
      });
    },
    onError: (err: any) =>
      toast({
        title: "Xato",
        description: err?.response?.data?.message || "Yaratishda xato",
        variant: "destructive",
      }),
  });

  const updateMu = useMutation({
    mutationFn: (payload: any) => $api.patch(`/users/${editing?.id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["role-users"] });
      toast({ title: "Yangilandi" });
      setEditing(null);
    },
    onError: (err: any) =>
      toast({
        title: "Xato",
        description: err?.response?.data?.message || "Yangilashda xato",
        variant: "destructive",
      }),
  });

  const deleteMu = useMutation({
    mutationFn: (id: number) => $api.delete(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["role-users"] });
      toast({ title: "O'chirildi" });
      setConfirmDel(null);
    },
    onError: (err: any) =>
      toast({
        title: "Xato",
        description: err?.response?.data?.message || "O'chirishda xato",
        variant: "destructive",
      }),
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const payload: any = {
      full_name: editForm.full_name,
      email: editForm.email,
      phone: editForm.phone,
    };
    if (editForm.password && editForm.password.length >= 4) {
      payload.password = editForm.password;
    }
    updateMu.mutate(payload);
  };

  const addButtonLabel =
    role === UserRole.OPERATOR ? "Operator qo'shish" : "Admin qo'shish";
  const drawerTitle =
    role === UserRole.OPERATOR ? "Yangi operator qo'shish" : "Yangi admin qo'shish";
  const editTitle =
    role === UserRole.OPERATOR ? "Operatorni tahrirlash" : "Adminni tahrirlash";
  const deleteTitle =
    role === UserRole.OPERATOR ? "Operatorni o'chirish" : "Adminni o'chirish";
  const emptyText =
    role === UserRole.OPERATOR ? "Operator topilmadi" : "Admin topilmadi";

  return (
    <EntPage>
      <EntToolbar
        title="Adminlar va operatorlar"
        actions={
          <EntButton
            variant="primary"
            onClick={() => setAdding(true)}
            size="sm"
          >
            <Plus size={14} />
            {addButtonLabel}
          </EntButton>
        }
      />

      <EntTabs>
        <EntTab active={tab === "admin"} onClick={() => setTab("admin")}>
          Adminlar
        </EntTab>
        <EntTab active={tab === "operator"} onClick={() => setTab("operator")}>
          Operatorlar
        </EntTab>
      </EntTabs>

      <EntFilterBar>
        <EntFilterField label="Qidiruv">
          <EntInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism yoki email"
            style={{ width: 280 }}
          />
        </EntFilterField>
        <div style={{ marginLeft: "auto" }} className="ent-muted">
          {isFetching && "yuklanmoqda..."}
        </div>
      </EntFilterBar>

      <EntTableWrap style={{ flex: 1, minHeight: 0 }}>
        <EntTable>
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th>Ism</th>
              <th style={{ width: 220 }}>Email</th>
              <th style={{ width: 150 }}>Telefon</th>
              <th style={{ width: 90 }}>Holat</th>
              <th style={{ width: 110 }}>Sana</th>
              <th style={{ width: 90 }}>Amallar</th>
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
                  {emptyText}
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
                      {u.full_name || "Noma'lum"}
                    </div>
                    {u.login && (
                      <div className="ent-muted" style={{ fontSize: 11 }}>
                        {u.login}
                      </div>
                    )}
                  </td>
                  <td>{u.email || <span className="ent-muted">—</span>}</td>
                  <td className="ent-cell--code">{u.phone || "—"}</td>
                  <td>
                    {u.is_active ? (
                      <EntBadge variant="success">Faol</EntBadge>
                    ) : (
                      <EntBadge variant="danger">Bloklangan</EntBadge>
                    )}
                  </td>
                  <td className="ent-cell--code ent-muted">
                    {fmtDate(u.createdAt)}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <EntButton
                        size="icon"
                        title="Tahrirlash"
                        onClick={() => setEditing(u)}
                      >
                        <Pencil size={14} />
                      </EntButton>
                      <EntButton
                        size="icon"
                        variant="danger"
                        title="O'chirish"
                        onClick={() => setConfirmDel(u)}
                      >
                        <Trash2 size={14} />
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

      {/* Add drawer */}
      <EntDrawer
        open={adding}
        onClose={() => !addMu.isPending && setAdding(false)}
        title={drawerTitle}
        width={460}
        footer={
          <>
            <EntButton
              disabled={addMu.isPending}
              onClick={() => setAdding(false)}
            >
              Bekor qilish
            </EntButton>
            <EntButton
              variant="primary"
              disabled={addMu.isPending}
              onClick={(e) => {
                e.preventDefault();
                addMu.mutate(addForm);
              }}
            >
              {addMu.isPending ? "Saqlanmoqda..." : "Qo'shish"}
            </EntButton>
          </>
        }
      >
        <form
          className="ent-stack-y"
          onSubmit={(e) => {
            e.preventDefault();
            addMu.mutate(addForm);
          }}
        >
          <EntField label="To'liq ism" required>
            <EntInput
              value={addForm.full_name}
              onChange={(e) =>
                setAddForm({ ...addForm, full_name: e.target.value })
              }
              placeholder="F.I.O"
              required
            />
          </EntField>
          <EntField label="Email" required>
            <EntInput
              type="email"
              value={addForm.email}
              onChange={(e) =>
                setAddForm({ ...addForm, email: e.target.value })
              }
              placeholder="example@mail.com"
              required
            />
          </EntField>
          <EntField label="Login">
            <EntInput
              value={addForm.login}
              onChange={(e) =>
                setAddForm({ ...addForm, login: e.target.value })
              }
              placeholder="login"
            />
          </EntField>
          <EntField label="Telefon">
            <EntInput
              value={addForm.phone}
              onChange={(e) =>
                setAddForm({ ...addForm, phone: e.target.value })
              }
              placeholder="+998..."
            />
          </EntField>
          <EntField label="Parol" required hint="kamida 4 ta belgi">
            <EntInput
              type="password"
              value={addForm.password}
              onChange={(e) =>
                setAddForm({ ...addForm, password: e.target.value })
              }
              minLength={4}
              required
            />
          </EntField>
          <button type="submit" style={{ display: "none" }} />
        </form>
      </EntDrawer>

      {/* Edit drawer */}
      <EntDrawer
        open={!!editing}
        onClose={() => !updateMu.isPending && setEditing(null)}
        title={editTitle}
        width={460}
        footer={
          <>
            <EntButton
              disabled={updateMu.isPending}
              onClick={() => setEditing(null)}
            >
              Bekor qilish
            </EntButton>
            <EntButton
              variant="primary"
              disabled={updateMu.isPending}
              onClick={(e) => handleUpdate(e as any)}
            >
              {updateMu.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </EntButton>
          </>
        }
      >
        {editing && (
          <form className="ent-stack-y" onSubmit={handleUpdate}>
            <EntField label="To'liq ism" required>
              <EntInput
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
                required
              />
            </EntField>
            <EntField label="Email" required>
              <EntInput
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                required
              />
            </EntField>
            <EntField label="Telefon">
              <EntInput
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                placeholder="+998..."
              />
            </EntField>
            <EntField
              label="Yangi parol"
              hint="ixtiyoriy — bo'sh qoldirilsa o'zgarmaydi"
            >
              <EntInput
                type="password"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm({ ...editForm, password: e.target.value })
                }
                minLength={4}
              />
            </EntField>
            <button type="submit" style={{ display: "none" }} />
          </form>
        )}
      </EntDrawer>

      {/* Delete confirm */}
      <EntConfirmDialog
        open={!!confirmDel}
        title={deleteTitle}
        variant="danger"
        confirmLabel="O'chirish"
        busy={deleteMu.isPending}
        onClose={() => setConfirmDel(null)}
        onConfirm={() => confirmDel && deleteMu.mutate(confirmDel.id)}
        message={
          <>
            <strong>{confirmDel?.full_name}</strong>ni o'chirishni
            xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
          </>
        }
      />
    </EntPage>
  );
}
