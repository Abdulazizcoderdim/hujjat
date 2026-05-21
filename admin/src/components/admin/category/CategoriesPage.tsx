import {
  EntButton,
  EntConfirmDialog,
  EntDialog,
  EntField,
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
import { toast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { ICategory, IPagination } from "@/interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface CategoryResponse {
  items: ICategory[];
  pagination: IPagination;
}

const LIMIT_DEFAULT = 25;

const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function CategoriesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(LIMIT_DEFAULT);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 350);

  const [formOpen, setFormOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<ICategory | null>(null);
  const [selected, setSelected] = useState<ICategory | null>(null);
  const [formData, setFormData] = useState({ name: "", icon: "" });

  useEffect(() => {
    setPage(1);
  }, [debounced]);

  const { data, isLoading, isFetching } = useQuery<CategoryResponse>({
    queryKey: ["categories", { page, debounced, limit }],
    queryFn: async () => {
      const { data } = await $api.get("/categories", {
        params: { page, limit, search: debounced },
      });
      return data;
    },
    placeholderData: (prev) =>
      prev ?? {
        items: [],
        pagination: { total: 0, page: 1, limit, totalPages: 1 },
      },
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const createMu = useMutation({
    mutationFn: async (payload: { name: string; icon?: string }) =>
      (await $api.post("/categories", payload)).data,
    onSuccess: () => {
      toast({ title: "Kategoriya qo'shildi" });
      qc.invalidateQueries({ queryKey: ["categories"] });
      setFormOpen(false);
    },
    onError: (err: any) =>
      toast({
        title: "Xato",
        description: err?.response?.data?.message || "Yaratishda xato",
        variant: "destructive",
      }),
  });

  const updateMu = useMutation({
    mutationFn: async (args: {
      id: string;
      payload: { name: string; icon?: string };
    }) => (await $api.patch(`/categories/${args.id}`, args.payload)).data,
    onSuccess: () => {
      toast({ title: "Kategoriya yangilandi" });
      qc.invalidateQueries({ queryKey: ["categories"] });
      setFormOpen(false);
    },
    onError: (err: any) =>
      toast({
        title: "Xato",
        description: err?.response?.data?.message || "Yangilashda xato",
        variant: "destructive",
      }),
  });

  const deleteMu = useMutation({
    mutationFn: async (id: string) =>
      (await $api.delete(`/categories/${id}`)).data,
    onSuccess: () => {
      toast({ title: "Kategoriya o'chirildi" });
      qc.invalidateQueries({ queryKey: ["categories"] });
      setConfirmDel(null);
    },
    onError: (err: any) =>
      toast({
        title: "Xato",
        description: err?.response?.data?.message || "O'chirishda xato",
        variant: "destructive",
      }),
  });

  const handleCreate = () => {
    setSelected(null);
    setFormData({ name: "", icon: "" });
    setFormOpen(true);
  };

  const handleEdit = (cat: ICategory) => {
    setSelected(cat);
    setFormData({ name: cat.name, icon: cat.icon ?? "" });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Xato",
        description: "Kategoriya nomini kiriting",
        variant: "destructive",
      });
      return;
    }
    const payload = {
      name: formData.name.trim(),
      icon: formData.icon.trim() || undefined,
    };
    if (selected) updateMu.mutate({ id: selected.id, payload });
    else createMu.mutate(payload);
  };

  return (
    <EntPage>
      <EntToolbar
        title="Kategoriyalar"
        actions={
          <EntButton variant="primary" onClick={handleCreate} size="sm">
            <Plus size={14} /> Yangi kategoriya
          </EntButton>
        }
      />

      <EntFilterBar>
        <EntFilterField label="Qidiruv">
          <EntInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kategoriya nomi"
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
              <th style={{ width: 60 }}>Ikon</th>
              <th>Nom</th>
              <th style={{ width: 160 }}>Slug</th>
              <th style={{ width: 110 }}>Yaratilgan</th>
              <th style={{ width: 90 }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="ent-empty">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="ent-empty">
                  Kategoriya topilmadi
                </td>
              </tr>
            ) : (
              items.map((c, idx) => (
                <tr key={c.id}>
                  <td className="ent-cell--num ent-muted">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td style={{ fontSize: 18 }}>
                    {c.icon || <span className="ent-muted">—</span>}
                  </td>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td className="ent-cell--code ent-muted">{c.slug}</td>
                  <td className="ent-cell--code ent-muted">
                    {fmtDate(c.createdAt)}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <EntButton
                        size="icon"
                        title="Tahrirlash"
                        onClick={() => handleEdit(c)}
                      >
                        <Pencil size={14} />
                      </EntButton>
                      <EntButton
                        size="icon"
                        variant="danger"
                        title="O'chirish"
                        onClick={() => setConfirmDel(c)}
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

      {/* Create / Edit dialog */}
      <EntDialog
        open={formOpen}
        onClose={() =>
          !createMu.isPending && !updateMu.isPending && setFormOpen(false)
        }
        title={selected ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
        width={420}
        footer={
          <>
            <EntButton
              disabled={createMu.isPending || updateMu.isPending}
              onClick={() => setFormOpen(false)}
            >
              Bekor qilish
            </EntButton>
            <EntButton
              variant="primary"
              disabled={createMu.isPending || updateMu.isPending}
              onClick={(e) => handleSubmit(e as any)}
            >
              {createMu.isPending || updateMu.isPending
                ? "Saqlanmoqda..."
                : selected
                  ? "Saqlash"
                  : "Qo'shish"}
            </EntButton>
          </>
        }
      >
        <form className="ent-stack-y" onSubmit={handleSubmit}>
          <EntField label="Nom" required>
            <EntInput
              autoFocus
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              maxLength={120}
            />
          </EntField>
          <EntField label="Ikonka (emoji, ixtiyoriy)">
            <EntInput
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              placeholder="📚"
              maxLength={10}
            />
          </EntField>
          <button type="submit" style={{ display: "none" }} />
        </form>
      </EntDialog>

      {/* Delete confirm */}
      <EntConfirmDialog
        open={!!confirmDel}
        title="Kategoriyani o'chirish"
        variant="danger"
        confirmLabel="O'chirish"
        busy={deleteMu.isPending}
        onClose={() => setConfirmDel(null)}
        onConfirm={() => confirmDel && deleteMu.mutate(confirmDel.id)}
        message={
          <>
            <strong>"{confirmDel?.name}"</strong> kategoriyasi o'chirilsinmi? Bu
            amalni qaytarib bo'lmaydi.
          </>
        }
      />
    </EntPage>
  );
}
