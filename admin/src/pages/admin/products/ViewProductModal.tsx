import {
  EntBadge,
  EntButton,
  EntCard,
  EntDialog,
} from "@/components/enterprise";
import { isEduConfigured } from "@/http/edusystem";
import { ICategory, ICurriculumLink, IProduct } from "@/interface";
import {
  fetchCurriculumLinks,
  fetchCurriculums,
  fetchSemesters,
  fetchSubjects,
} from "@/service/edusystem";
import { useQuery } from "@tanstack/react-query";
import { FileText, GraduationCap, Star } from "lucide-react";

const fmt = (v?: any) => (v ? v : "—");

export function ViewProductModal({
  product,
  isOpen,
  onClose,
}: {
  product: IProduct<ICategory> | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: links } = useQuery<ICurriculumLink[]>({
    queryKey: ["product-curriculum-links", product?.id],
    queryFn: () => fetchCurriculumLinks(product!.id),
    enabled: !!product?.id && isOpen && !!(product as any)?.isCurriculumBook,
  });

  const { data: curriculums } = useQuery({
    queryKey: ["edu", "curriculums"],
    queryFn: fetchCurriculums,
    enabled: isEduConfigured && !!links?.length,
    staleTime: 5 * 60 * 1000,
  });
  const { data: subjects } = useQuery({
    queryKey: ["edu", "subjects", "curriculum-only"],
    queryFn: () => fetchSubjects(true),
    enabled: isEduConfigured && !!links?.length,
    staleTime: 5 * 60 * 1000,
  });
  const { data: semesters } = useQuery({
    queryKey: ["edu", "semesters"],
    queryFn: fetchSemesters,
    enabled: isEduConfigured && !!links?.length,
    staleTime: 5 * 60 * 1000,
  });

  if (!product) return null;
  const p = product as any;

  const curriculumNameById = new Map(
    (curriculums ?? []).map((c) => [c.id, c.name]),
  );
  const subjectNameById = new Map(
    (subjects ?? []).map((s) => [s.id, s.name]),
  );
  const semesterNameByValue = new Map(
    (semesters ?? []).map((s) => [s.value ?? s.id, s.name]),
  );

  return (
    <EntDialog
      open={isOpen}
      onClose={onClose}
      title="Mahsulot tafsilotlari"
      width={760}
      footer={<EntButton onClick={onClose}>Yopish</EntButton>}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "180px 1fr",
          gap: 12,
        }}
      >
        {/* Left: poster + file */}
        <div>
          {p.poster ? (
            <img
              src={p.poster}
              alt={p.name}
              style={{
                width: 180,
                height: 240,
                objectFit: "cover",
                border: "1px solid var(--ent-border)",
              }}
            />
          ) : (
            <div
              style={{
                width: 180,
                height: 240,
                background: "var(--ent-bg)",
                border: "1px solid var(--ent-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--ent-text-faint)",
                fontSize: 11,
              }}
            >
              Poster yo'q
            </div>
          )}

          {p.fileUrl && (
            <EntButton
              size="sm"
              variant="primary"
              style={{ width: "100%", marginTop: 6 }}
              onClick={() => window.open(p.fileUrl, "_blank")}
            >
              <FileText size={14} /> Hujjatni ochish
              {p.fileSize ? ` (${(p.fileSize / 1024 / 1024).toFixed(2)} MB)` : ""}
            </EntButton>
          )}
        </div>

        {/* Right: metadata */}
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 2,
            }}
          >
            {p.name}
          </div>
          <div className="ent-muted" style={{ fontSize: 12, marginBottom: 8 }}>
            {p.author || "—"}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr",
              gap: "3px 8px",
              fontSize: 12,
              alignItems: "baseline",
            }}
          >
            <div className="ent-muted">Shifr:</div>
            <div className="ent-cell--code">{fmt(p.shelfCode)}</div>

            <div className="ent-muted">Kategoriya:</div>
            <div>{fmt(p.category?.name)}</div>

            <div className="ent-muted">Yil:</div>
            <div className="ent-cell--code">{fmt(p.year)}</div>

            <div className="ent-muted">Til:</div>
            <div>{fmt(p.language)}</div>

            <div className="ent-muted">Sahifalar:</div>
            <div className="ent-cell--code">{fmt(p.pages)}</div>

            <div className="ent-muted">Holat:</div>
            <div>
              {p.status === "approved" ? (
                <EntBadge variant="success">Tasdiqlangan</EntBadge>
              ) : (
                <EntBadge variant="danger">Rad etilgan</EntBadge>
              )}
            </div>
          </div>

          {p.description && (
            <EntCard
              title="Tavsif"
              className="ent-card"
              bodyClassName="ent-card__body"
            >
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                {p.description}
              </div>
            </EntCard>
          )}

          {p.tags?.length > 0 && (
            <EntCard title="Teglar" className="ent-card">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {p.tags.map((t: string) => (
                  <EntBadge key={t} variant="muted">
                    {t}
                  </EntBadge>
                ))}
              </div>
            </EntCard>
          )}

          {p.isCurriculumBook && (
            <EntCard
              title={
                <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                  <GraduationCap size={13} />
                  Biriktirilgan o'quv rejalar
                </span>
              }
              className="ent-card"
            >
              {!links ? (
                <span className="ent-muted">Yuklanmoqda...</span>
              ) : links.length === 0 ? (
                <span className="ent-muted">Biriktirish yo'q</span>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {links.map((l) => (
                    <li
                      key={l.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 6,
                        padding: "3px 0",
                        borderBottom: "1px dotted var(--ent-border)",
                        fontSize: 12,
                      }}
                    >
                      <EntBadge>{l.semester}-sem</EntBadge>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div>
                          {curriculumNameById.get(l.curriculumId) ??
                            `O'quv reja #${l.curriculumId}`}
                        </div>
                        <div className="ent-muted" style={{ fontSize: 11 }}>
                          {subjectNameById.get(l.subjectId) ??
                            `Fan #${l.subjectId}`}
                          {" · "}
                          {semesterNameByValue.get(l.semester) ??
                            `${l.semester}-semestr`}
                        </div>
                      </div>
                      {l.isMain && (
                        <EntBadge variant="success">
                          <Star size={10} /> Asosiy
                        </EntBadge>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </EntCard>
          )}
        </div>
      </div>
    </EntDialog>
  );
}
