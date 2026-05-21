import {
  EntBadge,
  EntButton,
  EntEmpty,
  EntInput,
  EntPage,
  EntTable,
  EntTableWrap,
  EntToolbar,
} from "@/components/enterprise";
import { fetchLoans, returnLoan } from "@/service/library";
import { ILoan } from "@/interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";

const formatDateTime = (iso?: string | null) => {
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

export function QuickReturnPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [match, setMatch] = useState<ILoan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<ILoan[]>([]);
  const qc = useQueryClient();

  // History of latest returned loans (server-side, last 10)
  const historyQ = useQuery({
    queryKey: ["loans", "history-recent"],
    queryFn: () =>
      fetchLoans({ status: "returned", page: 1, limit: 10 }),
  });

  const lookupMu = useMutation({
    mutationFn: async (q: string) => {
      const { items } = await fetchLoans({
        status: "active",
        search: q,
        page: 1,
        limit: 5,
      });
      return items;
    },
    onSuccess: (items, q) => {
      if (items.length === 0) {
        setMatch(null);
        setError(`"${q}" bo'yicha faol qarz topilmadi`);
        return;
      }
      if (items.length > 1) {
        // pick exact shelfCode match if possible
        const exact = items.find(
          (i) => i.product?.shelfCode?.toLowerCase() === q.trim().toLowerCase(),
        );
        if (exact) {
          setMatch(exact);
          setError(null);
          return;
        }
        setMatch(null);
        setError(
          `${items.length} ta natija topildi — aniqroq qidiring (masalan, talabaning to'liq raqami)`,
        );
        return;
      }
      setMatch(items[0]);
      setError(null);
    },
    onError: () => {
      setError("Tarmoq xatosi");
    },
  });

  const returnMu = useMutation({
    mutationFn: returnLoan,
    onSuccess: (loan) => {
      toast.success(`"${loan.product?.name}" qaytarib olindi`);
      setRecent((r) => [loan, ...r].slice(0, 10));
      setMatch(null);
      setCode("");
      setError(null);
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["library-catalog"] });
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Xato yuz berdi"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = code.trim();
    if (!q) return;
    setMatch(null);
    setError(null);
    lookupMu.mutate(q);
  };

  const recentList = recent.length > 0 ? recent : historyQ.data?.items ?? [];

  return (
    <EntPage>
      <EntToolbar title="Tezkor qaytarish" />

      <div
        style={{
          padding: 12,
          background: "var(--ent-surface)",
          border: "1px solid var(--ent-border)",
          borderTop: 0,
        }}
      >
        <form onSubmit={handleSubmit}>
          <label
            style={{
              fontSize: 12,
              color: "var(--ent-text-muted)",
              display: "block",
              marginBottom: 4,
            }}
          >
            Shifr, kitob nomi, FIO yoki talabalik raqami:
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            <EntInput
              ref={inputRef}
              autoFocus
              mono
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="728.4 yoki talabaning ID raqami..."
              style={{
                flex: 1,
                fontSize: 16,
                height: 40,
                padding: "0 12px",
              }}
            />
            <EntButton
              variant="primary"
              type="submit"
              disabled={!code.trim() || lookupMu.isPending}
              style={{ height: 40, padding: "0 20px" }}
            >
              {lookupMu.isPending ? "Qidirilmoqda..." : "Qidirish"}
            </EntButton>
          </div>
        </form>

        {error && (
          <div
            style={{
              marginTop: 10,
              padding: "8px 10px",
              border: "1px solid var(--ent-danger)",
              background: "var(--ent-danger-bg)",
              color: "var(--ent-danger)",
              fontSize: 12,
            }}
          >
            {error}
          </div>
        )}

        {match && (
          <div
            style={{
              marginTop: 10,
              border: "1px solid var(--ent-accent)",
              background: "var(--ent-accent-soft)",
              padding: 10,
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 8,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>
                {match.product?.name}
              </div>
              <div className="ent-muted" style={{ fontSize: 12 }}>
                {match.product?.author || "—"} · Shifr:{" "}
                <span className="ent-cell--code">
                  {match.product?.shelfCode || "—"}
                </span>
              </div>
              <div style={{ marginTop: 6, fontSize: 12 }}>
                <strong>Talaba:</strong> {match.user?.full_name} ·{" "}
                <span className="ent-cell--code">
                  {match.user?.student_id_number || match.user?.login}
                </span>{" "}
                · {match.user?.group || "—"}
              </div>
              <div className="ent-muted" style={{ fontSize: 11, marginTop: 4 }}>
                Berilgan: {formatDateTime(match.borrowedAt)} · Qaytarish:{" "}
                {formatDateTime(match.dueAt)}
              </div>
            </div>
            <EntButton
              variant="primary"
              disabled={returnMu.isPending}
              onClick={() => returnMu.mutate(match.id)}
              style={{ height: 40, padding: "0 20px" }}
              autoFocus
            >
              ✓ Qaytarildi
            </EntButton>
          </div>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <div
          style={{
            padding: "4px 8px",
            background: "var(--ent-surface)",
            border: "1px solid var(--ent-border)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          So'nggi qaytarishlar
        </div>
        <EntTableWrap>
          <EntTable compact>
            <thead>
              <tr>
                <th style={{ width: 130 }}>Sana</th>
                <th>Kitob</th>
                <th style={{ width: 110 }}>Shifr</th>
                <th>Talaba</th>
              </tr>
            </thead>
            <tbody>
              {recentList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="ent-empty">
                    Hali yo'q
                  </td>
                </tr>
              ) : (
                recentList.map((l) => (
                  <tr key={l.id}>
                    <td className="ent-cell--code">
                      {formatDateTime(l.returnedAt)}
                    </td>
                    <td>{l.product?.name}</td>
                    <td className="ent-cell--code">
                      {l.product?.shelfCode || (
                        <span className="ent-muted">—</span>
                      )}
                    </td>
                    <td>{l.user?.full_name}</td>
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

export default QuickReturnPage;
