import {
  EntBadge,
  EntButton,
  EntDialog,
  EntInput,
  EntTable,
  EntTableWrap,
} from "@/components/enterprise";
import { useDebounce } from "@/hooks/use-debounce";
import { ILoanUser } from "@/interface";
import { createLoan, fetchStudents } from "@/service/library";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  product: {
    id: number;
    name: string;
    author?: string;
    shelfCode?: string;
  } | null;
  onClose: (success?: boolean) => void;
}

const PRESETS = [
  { days: 7, label: "7 kun" },
  { days: 14, label: "14 kun" },
  { days: 30, label: "30 kun" },
];

const todayPlusDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export function LendDialog({ product, onClose }: Props) {
  const open = !!product;
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const [selected, setSelected] = useState<ILoanUser | null>(null);
  const [dueAt, setDueAt] = useState(todayPlusDays(14));
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelected(null);
      setDueAt(todayPlusDays(14));
      setNotes("");
    }
  }, [open, product?.id]);

  const studentsQ = useQuery({
    queryKey: ["lend-students", debounced],
    queryFn: () => fetchStudents(debounced, 15),
    enabled: open && debounced.trim().length >= 1,
  });

  const lendMu = useMutation({
    mutationFn: createLoan,
    onSuccess: () => {
      toast.success("Kitob talabaga berildi ✓");
      onClose(true);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Xato yuz berdi");
    },
  });

  const dueOK = !!dueAt && new Date(dueAt).getTime() >= Date.now() - 60_000;
  const canLend = !!product && !!selected && dueOK && !lendMu.isPending;

  const handleSubmit = () => {
    if (!canLend) return;
    lendMu.mutate({
      productId: product!.id,
      userId: selected!.id,
      dueAt: new Date(dueAt + "T12:00:00").toISOString(),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <EntDialog
      open={open}
      onClose={() => !lendMu.isPending && onClose(false)}
      title="Talabaga berish"
      width={780}
      footer={
        <>
          <EntButton
            disabled={lendMu.isPending}
            onClick={() => onClose(false)}
          >
            Bekor qilish
          </EntButton>
          <EntButton
            variant="primary"
            disabled={!canLend}
            onClick={handleSubmit}
          >
            {lendMu.isPending ? "Yuklanmoqda..." : "Berish"}
          </EntButton>
        </>
      }
    >
      {product && (
        <>
          {/* Book banner */}
          <div
            style={{
              border: "1px solid var(--ent-border)",
              background: "var(--ent-accent-soft)",
              padding: "6px 10px",
              marginBottom: 10,
              display: "flex",
              gap: 16,
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 600 }}>{product.name}</div>
            <div className="ent-muted">{product.author || ""}</div>
            <div style={{ marginLeft: "auto" }}>
              <span className="ent-muted">Shifr:</span>{" "}
              <span className="ent-cell--code">
                {product.shelfCode || "—"}
              </span>
            </div>
          </div>

          {/* Step 1: student search */}
          <div style={{ marginBottom: 6, display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: 11,
                  color: "var(--ent-text-muted)",
                  display: "block",
                  marginBottom: 2,
                }}
              >
                1. Talabani tanlang
              </label>
              <EntInput
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="FIO yoki talabalik raqami"
                style={{ width: "100%" }}
              />
            </div>
            {selected && (
              <div
                style={{
                  padding: "4px 8px",
                  border: "1px solid var(--ent-accent)",
                  background: "var(--ent-accent-soft)",
                  alignSelf: "flex-end",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 12 }}>
                  {selected.full_name}
                </div>
                <div className="ent-muted" style={{ fontSize: 11 }}>
                  {selected.student_id_number} · {selected.group || "—"}
                </div>
              </div>
            )}
          </div>

          <EntTableWrap style={{ maxHeight: 240, marginBottom: 12 }}>
            <EntTable compact>
              <thead>
                <tr>
                  <th style={{ width: 30 }}></th>
                  <th>FIO</th>
                  <th style={{ width: 130 }}>Talaba ID</th>
                  <th style={{ width: 120 }}>Guruh</th>
                  <th style={{ width: 80 }}>Kurs</th>
                </tr>
              </thead>
              <tbody>
                {!debounced.trim() ? (
                  <tr>
                    <td colSpan={5} className="ent-empty">
                      Qidirish uchun FIO yoki talabalik raqamini yozing
                    </td>
                  </tr>
                ) : studentsQ.isLoading ? (
                  <tr>
                    <td colSpan={5} className="ent-empty">
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : (studentsQ.data?.items ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="ent-empty">
                      Talaba topilmadi
                    </td>
                  </tr>
                ) : (
                  studentsQ.data!.items.map((s) => {
                    const isSel = selected?.id === s.id;
                    return (
                      <tr
                        key={s.id}
                        onClick={() => setSelected(s)}
                        className={isSel ? "ent-row-selected" : ""}
                        style={{ cursor: "pointer" }}
                      >
                        <td className="ent-cell--center">
                          <input
                            type="radio"
                            checked={isSel}
                            onChange={() => setSelected(s)}
                          />
                        </td>
                        <td>{s.full_name || "—"}</td>
                        <td className="ent-cell--code">
                          {s.student_id_number || "—"}
                        </td>
                        <td className="ent-muted">{s.group || "—"}</td>
                        <td className="ent-muted">{s.level || "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </EntTable>
          </EntTableWrap>

          {/* Step 2: due date */}
          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                fontSize: 11,
                color: "var(--ent-text-muted)",
                display: "block",
                marginBottom: 2,
              }}
            >
              2. Qaytarish muddati
            </label>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {PRESETS.map((p) => {
                const presetVal = todayPlusDays(p.days);
                const active = dueAt === presetVal;
                return (
                  <EntButton
                    key={p.days}
                    size="xs"
                    variant={active ? "primary" : "default"}
                    onClick={() => setDueAt(presetVal)}
                  >
                    {p.label}
                  </EntButton>
                );
              })}
              <span className="ent-muted">yoki</span>
              <EntInput
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                style={{ width: 160 }}
              />
              {dueAt && (
                <EntBadge variant="muted">
                  {new Date(dueAt).toLocaleDateString("uz-UZ")}
                </EntBadge>
              )}
            </div>
            {!dueOK && (
              <div
                style={{
                  color: "var(--ent-danger)",
                  fontSize: 11,
                  marginTop: 4,
                }}
              >
                Muddat o'tmishda bo'lishi mumkin emas
              </div>
            )}
          </div>

          {/* Step 3: notes */}
          <div>
            <label
              style={{
                fontSize: 11,
                color: "var(--ent-text-muted)",
                display: "block",
                marginBottom: 2,
              }}
            >
              3. Izoh (ixtiyoriy)
            </label>
            <textarea
              className="ent-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              style={{
                width: "100%",
                height: "auto",
                padding: 6,
                fontFamily: "inherit",
                resize: "vertical",
              }}
              maxLength={500}
            />
          </div>
        </>
      )}
    </EntDialog>
  );
}
