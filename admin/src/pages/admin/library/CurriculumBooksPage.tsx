import {
  EntBadge,
  EntButton,
  EntInput,
  EntPage,
  EntToolbar,
} from "@/components/enterprise";
import {
  ICurriculumTreeNode,
  ICurriculumTreeSemester,
  ICurriculumTreeSubject,
} from "@/interface";
import {
  fetchProductsByCurriculumLink,
  fetchCurriculumTree,
} from "@/service/products";
import {
  fetchCurriculums,
  fetchSubjects,
} from "@/service/edusystem";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Download,
  GraduationCap,
  RefreshCw,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

const fmtSemester = (s: number) => `${s}-semestr`;

// 12 ta semestr uchun aniq farqlanadigan rang palitrasi
// (background tint + foreground accent). Yorug' va qorong'u temada ham o'qiladi.
const SEMESTER_PALETTE: Array<{ bg: string; fg: string; border: string }> = [
  { bg: "#dbeafe", fg: "#1d4ed8", border: "#93c5fd" }, // 1
  { bg: "#dcfce7", fg: "#15803d", border: "#86efac" }, // 2
  { bg: "#fef3c7", fg: "#a16207", border: "#fcd34d" }, // 3
  { bg: "#fce7f3", fg: "#be185d", border: "#f9a8d4" }, // 4
  { bg: "#e0e7ff", fg: "#4338ca", border: "#a5b4fc" }, // 5
  { bg: "#ffedd5", fg: "#c2410c", border: "#fdba74" }, // 6
  { bg: "#cffafe", fg: "#0e7490", border: "#67e8f9" }, // 7
  { bg: "#f3e8ff", fg: "#7e22ce", border: "#d8b4fe" }, // 8
  { bg: "#fee2e2", fg: "#b91c1c", border: "#fca5a5" }, // 9
  { bg: "#ecfccb", fg: "#4d7c0f", border: "#bef264" }, // 10
  { bg: "#f0fdfa", fg: "#0f766e", border: "#5eead4" }, // 11
  { bg: "#fef2f2", fg: "#9f1239", border: "#fda4af" }, // 12
];

const semesterColor = (n: number) =>
  SEMESTER_PALETTE[(n - 1 + SEMESTER_PALETTE.length) % SEMESTER_PALETTE.length];

interface SubjectRowProps {
  curriculumId: number;
  semester: number;
  subject: ICurriculumTreeSubject;
  subjectName: string;
}

function SubjectRow({
  curriculumId,
  semester,
  subject,
  subjectName,
}: SubjectRowProps) {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [
      "cur-tree-books",
      curriculumId,
      semester,
      subject.subjectId,
    ],
    queryFn: () =>
      fetchProductsByCurriculumLink({
        curriculumId,
        semester,
        subjectId: subject.subjectId,
      }),
    enabled: open,
    staleTime: 60_000,
  });

  const items: any[] = data?.items ?? [];

  return (
    <div
      style={{
        border: "1px solid var(--ent-border)",
        background: "var(--ent-surface)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          background: "transparent",
          border: 0,
          cursor: "pointer",
          textAlign: "left",
          fontSize: 12,
        }}
      >
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <BookOpen size={13} className="ent-muted" />
        <span style={{ flex: 1, fontWeight: 500 }}>{subjectName}</span>
        <EntBadge variant="muted">{subject.bookCount} ta kitob</EntBadge>
      </button>

      {open && (
        <div
          style={{
            borderTop: "1px solid var(--ent-border)",
            padding: 8,
            background: "var(--ent-bg)",
          }}
        >
          {isLoading ? (
            <div className="ent-muted" style={{ fontSize: 12 }}>
              Yuklanmoqda...
            </div>
          ) : items.length === 0 ? (
            <div className="ent-muted" style={{ fontSize: 12 }}>
              Kitob topilmadi
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                fontSize: 12,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ width: 30, padding: "2px 4px" }}>#</th>
                  <th style={{ padding: "2px 4px" }}>Nom</th>
                  <th style={{ width: 160, padding: "2px 4px" }}>Muallif</th>
                  <th style={{ width: 90, padding: "2px 4px" }}>Shifr</th>
                  <th style={{ width: 70, padding: "2px 4px" }}>UDK</th>
                  <th style={{ width: 60, padding: "2px 4px" }}>Yil</th>
                  <th style={{ width: 90, padding: "2px 4px" }}>Yuklab olish</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p: any, i: number) => {
                  const downloadName = p.name
                    ? `${p.name}${p.fileExt ?? ""}`
                    : undefined;
                  return (
                    <tr
                      key={p.id}
                      style={{ borderTop: "1px solid var(--ent-border)" }}
                    >
                      <td className="ent-cell--num ent-muted">{i + 1}</td>
                      <td style={{ padding: "3px 4px", fontWeight: 500 }}>
                        {p.name}
                      </td>
                      <td
                        className="ent-muted"
                        style={{ padding: "3px 4px" }}
                      >
                        {p.author || "—"}
                      </td>
                      <td className="ent-cell--code">{p.shelfCode || "—"}</td>
                      <td className="ent-cell--code">{p.udc || "—"}</td>
                      <td className="ent-cell--num">{p.year || "—"}</td>
                      <td>
                        {p.fileUrl ? (
                          <EntButton
                            size="xs"
                            title="Faylni yuklab olish"
                            onClick={() => {
                              const a = document.createElement("a");
                              a.href = p.fileUrl;
                              if (downloadName) a.download = downloadName;
                              a.target = "_blank";
                              a.rel = "noopener";
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                            }}
                          >
                            <Download size={12} /> Yuklash
                          </EntButton>
                        ) : (
                          <span className="ent-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

interface SemesterBlockProps {
  curriculumId: number;
  semester: ICurriculumTreeSemester;
  subjectName: (id: number) => string;
}

function SemesterBlock({
  curriculumId,
  semester,
  subjectName,
}: SemesterBlockProps) {
  const c = semesterColor(semester.semester);
  return (
    <div
      className="ent-stack-y"
      style={{
        gap: 4,
        borderLeft: `3px solid ${c.fg}`,
        paddingLeft: 8,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          background: c.bg,
          color: c.fg,
          border: `1px solid ${c.border}`,
          padding: "4px 8px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          borderRadius: 2,
        }}
      >
        <GraduationCap size={12} />
        {fmtSemester(semester.semester)}
        <span style={{ flex: 1 }} />
        <span
          style={{
            background: c.fg,
            color: "#fff",
            padding: "1px 6px",
            fontSize: 10,
            borderRadius: 2,
            fontWeight: 700,
          }}
        >
          {semester.totalBooks} ta
        </span>
      </div>
      <div className="ent-stack-y" style={{ gap: 2 }}>
        {semester.subjects.map((sub) => (
          <SubjectRow
            key={sub.subjectId}
            curriculumId={curriculumId}
            semester={semester.semester}
            subject={sub}
            subjectName={subjectName(sub.subjectId)}
          />
        ))}
      </div>
    </div>
  );
}

interface CurriculumCardProps {
  node: ICurriculumTreeNode;
  curriculumName: string;
  subjectName: (id: number) => string;
}

function CurriculumCard({
  node,
  curriculumName,
  subjectName,
}: CurriculumCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="ent-card"
      style={{ width: "100%", overflow: "hidden" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: "transparent",
          border: 0,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <GraduationCap size={16} className="ent-muted" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={curriculumName}
          >
            {curriculumName}
          </div>
          <div
            className="ent-muted"
            style={{ fontSize: 11, marginTop: 2 }}
          >
            {node.semesters.length} ta semestr,{" "}
            {node.semesters.reduce((s, x) => s + x.subjects.length, 0)} ta fan
          </div>
        </div>
        <EntBadge variant="success">
          Jami {node.totalBooks} ta kitob
        </EntBadge>
      </button>

      {open && (
        <div
          style={{
            borderTop: "1px solid var(--ent-border)",
            padding: 10,
            background: "var(--ent-bg)",
            display: "grid",
            gap: 10,
          }}
        >
          {node.semesters.map((sem) => (
            <SemesterBlock
              key={sem.semester}
              curriculumId={node.curriculumId}
              semester={sem}
              subjectName={subjectName}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CurriculumBooksPage() {
  const [search, setSearch] = useState("");

  const treeQ = useQuery({
    queryKey: ["curriculum-tree"],
    queryFn: fetchCurriculumTree,
  });

  const curriculumsQ = useQuery({
    queryKey: ["edu-curriculums"],
    queryFn: fetchCurriculums,
    staleTime: 5 * 60_000,
  });

  const subjectsQ = useQuery({
    queryKey: ["edu-subjects"],
    queryFn: () => fetchSubjects(true),
    staleTime: 5 * 60_000,
  });

  const curriculumNameById = useMemo(() => {
    const m = new Map<number, string>();
    (curriculumsQ.data ?? []).forEach((c) => m.set(c.id, c.name));
    return m;
  }, [curriculumsQ.data]);

  const subjectNameById = useMemo(() => {
    const m = new Map<number, string>();
    (subjectsQ.data ?? []).forEach((s) => m.set(s.id, s.name));
    return m;
  }, [subjectsQ.data]);

  const curName = (id: number) =>
    curriculumNameById.get(id) ?? `O'quv reja #${id}`;
  const subName = (id: number) => subjectNameById.get(id) ?? `Fan #${id}`;

  const filtered = useMemo(() => {
    const nodes = treeQ.data?.curricula ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return nodes;
    return nodes.filter((n) => curName(n.curriculumId).toLowerCase().includes(q));
  }, [treeQ.data, search, curriculumNameById]);

  return (
    <EntPage>
      <EntToolbar
        title="O'quv reja kitoblari"
        actions={
          <EntButton onClick={() => treeQ.refetch()}>
            <RefreshCw size={14} /> Yangilash
          </EntButton>
        }
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 6px",
        }}
      >
        <Search size={14} className="ent-muted" />
        <EntInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="O'quv reja nomi bo'yicha qidirish"
          style={{ width: 360 }}
        />
        <div style={{ marginLeft: "auto" }} className="ent-muted">
          {treeQ.isFetching && (
            <span style={{ fontSize: 12 }}>yuklanmoqda...</span>
          )}
        </div>
      </div>

      <div
        className="ent-stack-y"
        style={{ padding: 6, gap: 8, flex: 1, overflowY: "auto" }}
      >
        {treeQ.isLoading ? (
          <div className="ent-empty">Yuklanmoqda...</div>
        ) : treeQ.isError ? (
          <div className="ent-empty">O'quv reja yuklashda xato yuz berdi</div>
        ) : curriculumsQ.isError ? (
          <div className="ent-empty">O'quv rejalar yuklashda xato yuz berdi</div>
        ) : subjectsQ.isError ? (
          <div className="ent-empty">Fanlar yuklashda xato yuz berdi</div>
        ) : filtered.length === 0 ? (
          <div className="ent-empty">
            {search
              ? "Qidiruvga mos o'quv reja topilmadi"
              : "Hozircha o'quv rejaga bog'langan kitob yo'q"}
          </div>
        ) : (
          filtered.map((node) => (
            <CurriculumCard
              key={node.curriculumId}
              node={node}
              curriculumName={curName(node.curriculumId)}
              subjectName={subName}
            />
          ))
        )}
      </div>
    </EntPage>
  );
}

export default CurriculumBooksPage;
