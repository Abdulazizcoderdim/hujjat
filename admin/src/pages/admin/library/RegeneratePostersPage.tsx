import {
  EntBadge,
  EntButton,
  EntCard,
  EntPage,
  EntTable,
  EntTableWrap,
  EntToolbar,
} from "@/components/enterprise";
import {
  BulkRegenerateResult,
  regenerateMissingPosters,
} from "@/service/products";
import { AlertCircle, ImagePlus, Pause, Play, Square } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const CHUNK_SIZE = 10;

interface RunStats {
  processed: number;
  succeeded: number;
  failed: number;
  remaining: number | null;
  errors: BulkRegenerateResult["errors"];
}

const emptyStats: RunStats = {
  processed: 0,
  succeeded: 0,
  failed: 0,
  remaining: null,
  errors: [],
};

export function RegeneratePostersPage() {
  const [stats, setStats] = useState<RunStats>(emptyStats);
  const [status, setStatus] = useState<"idle" | "running" | "paused" | "done">(
    "idle",
  );
  const stopRef = useRef(false);
  const pauseRef = useRef(false);

  const reset = () => {
    setStats(emptyStats);
    setStatus("idle");
    stopRef.current = false;
    pauseRef.current = false;
  };

  const run = async () => {
    stopRef.current = false;
    pauseRef.current = false;
    setStatus("running");

    while (!stopRef.current) {
      while (pauseRef.current && !stopRef.current) {
        await new Promise((r) => setTimeout(r, 300));
      }
      if (stopRef.current) break;

      let chunk: BulkRegenerateResult;
      try {
        chunk = await regenerateMissingPosters(CHUNK_SIZE);
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message || "Backend xatosi — to'xtatildi",
        );
        break;
      }

      setStats((prev) => ({
        processed: prev.processed + chunk.processed,
        succeeded: prev.succeeded + chunk.succeeded,
        failed: prev.failed + chunk.failed,
        remaining: chunk.remaining,
        errors: [...prev.errors, ...chunk.errors],
      }));

      // Backend hech narsa qayta ishlamadi → tugadi (yoki faqat fail bo'lganlar qoldi)
      if (chunk.processed === 0) break;
      // Hech qancha qolmadi
      if (chunk.remaining === 0) break;
    }

    setStatus("done");
  };

  return (
    <EntPage>
      <EntToolbar
        title="Posterlarni qayta yaratish"
        actions={
          <>
            {status === "idle" && (
              <EntButton variant="primary" onClick={run}>
                <Play size={14} /> Boshlash
              </EntButton>
            )}
            {status === "running" && (
              <>
                <EntButton
                  onClick={() => {
                    pauseRef.current = true;
                    setStatus("paused");
                  }}
                >
                  <Pause size={14} /> Pauza
                </EntButton>
                <EntButton
                  variant="danger"
                  onClick={() => {
                    stopRef.current = true;
                  }}
                >
                  <Square size={14} /> To'xtatish
                </EntButton>
              </>
            )}
            {status === "paused" && (
              <>
                <EntButton
                  variant="primary"
                  onClick={() => {
                    pauseRef.current = false;
                    setStatus("running");
                  }}
                >
                  <Play size={14} /> Davom etish
                </EntButton>
                <EntButton
                  variant="danger"
                  onClick={() => {
                    stopRef.current = true;
                    pauseRef.current = false;
                  }}
                >
                  <Square size={14} /> To'xtatish
                </EntButton>
              </>
            )}
            {status === "done" && (
              <EntButton onClick={reset}>Boshqatdan boshlash</EntButton>
            )}
          </>
        }
      />

      <div style={{ padding: 6, display: "grid", gap: 8 }}>
        <EntCard
          title={
            <span
              style={{
                display: "inline-flex",
                gap: 6,
                alignItems: "center",
              }}
            >
              <ImagePlus size={13} /> Posteri yo'q kitoblar
            </span>
          }
        >
          <div style={{ fontSize: 12, lineHeight: 1.6 }}>
            <p style={{ marginBottom: 6 }}>
              Bu vosita backend tarafida postersiz PDF kitoblarni topadi va
              har biri uchun 1-sahifani avto-generatsiya qilib qo'yadi.
              Brauzer tab'ini ochiq tuting — har {CHUNK_SIZE} ta kitob bo'lib
              ishlanadi.
            </p>
            <p
              className="ent-muted"
              style={{ fontSize: 11, marginBottom: 0 }}
            >
              Shifrlangan / buzilgan PDF'lar va katta hajmli fayllar
              muvaffaqiyatsiz tugashi mumkin — ular pastdagi xatolar
              ro'yxatida ko'rinadi.
            </p>
          </div>
        </EntCard>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 8,
          }}
        >
          <StatBox
            label="Qayta ishlangan"
            value={stats.processed}
            color="var(--ent-text)"
          />
          <StatBox
            label="Muvaffaqiyatli"
            value={stats.succeeded}
            color="#15803d"
          />
          <StatBox
            label="Xatolik"
            value={stats.failed}
            color="var(--ent-danger)"
          />
          <StatBox
            label="Qolgan"
            value={stats.remaining ?? "—"}
            color="var(--ent-text)"
          />
        </div>

        {status === "running" && (
          <div style={{ fontSize: 12 }} className="ent-muted">
            Ishlamoqda...
          </div>
        )}
        {status === "paused" && (
          <div style={{ fontSize: 12 }} className="ent-muted">
            Pauzada
          </div>
        )}
        {status === "done" && (
          <div style={{ fontSize: 12, fontWeight: 600 }}>
            ✓ Tugadi. {stats.succeeded} ta poster yaratildi, {stats.failed}{" "}
            ta xato.
          </div>
        )}

        {stats.errors.length > 0 && (
          <EntCard
            title={
              <span
                style={{
                  display: "inline-flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <AlertCircle size={13} /> Xatolar ({stats.errors.length})
              </span>
            }
          >
            <EntTableWrap>
              <EntTable>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>ID</th>
                    <th>Nom</th>
                    <th style={{ width: 320 }}>Sabab</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.errors.map((e, i) => (
                    <tr key={`${e.id}-${i}`}>
                      <td className="ent-cell--num ent-muted">{e.id}</td>
                      <td>{e.name}</td>
                      <td>
                        <EntBadge variant="danger">{e.reason}</EntBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </EntTable>
            </EntTableWrap>
          </EntCard>
        )}
      </div>
    </EntPage>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--ent-border)",
        background: "var(--ent-surface)",
        padding: 10,
      }}
    >
      <div className="ent-muted" style={{ fontSize: 11 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

export default RegeneratePostersPage;
