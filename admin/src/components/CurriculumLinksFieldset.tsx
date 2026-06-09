import {
  EntBadge,
  EntButton,
  EntCheckbox,
  EntSelect,
} from "@/components/enterprise";
import { SearchableSelect } from "@/components/SearchableSelect";
import { isEduConfigured } from "@/http/edusystem";
import {
  fetchCurriculums,
  fetchSemesters,
  fetchSubjects,
} from "@/service/edusystem";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, GraduationCap, Loader2, Plus, Trash2 } from "lucide-react";

export interface CurriculumLinkValue {
  curriculumId: number | "";
  semester: number | "";
  subjectId: number | "";
  isMain: boolean;
}

interface Props {
  value: CurriculumLinkValue[];
  onChange: (links: CurriculumLinkValue[]) => void;
  disabled?: boolean;
}

const blank = (): CurriculumLinkValue => ({
  curriculumId: "",
  semester: "",
  subjectId: "",
  isMain: false,
});

export function CurriculumLinksFieldset({ value, onChange, disabled }: Props) {
  const curriculumsQ = useQuery({
    queryKey: ["edu", "curriculums"],
    queryFn: fetchCurriculums,
    enabled: isEduConfigured,
    staleTime: 5 * 60 * 1000,
  });
  const subjectsQ = useQuery({
    queryKey: ["edu", "subjects", "curriculum-only"],
    queryFn: () => fetchSubjects(true),
    enabled: isEduConfigured,
    staleTime: 5 * 60 * 1000,
  });
  const semestersQ = useQuery({
    queryKey: ["edu", "semesters"],
    queryFn: fetchSemesters,
    enabled: isEduConfigured,
    staleTime: 5 * 60 * 1000,
  });

  const curriculums = curriculumsQ.data ?? [];
  const subjects = subjectsQ.data ?? [];
  const semesters = semestersQ.data ?? [];

  const isLoading =
    curriculumsQ.isLoading || subjectsQ.isLoading || semestersQ.isLoading;
  const hasError =
    !!curriculumsQ.error || !!subjectsQ.error || !!semestersQ.error;

  const updateRow = (idx: number, patch: Partial<CurriculumLinkValue>) => {
    onChange(value.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  };
  const removeRow = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };
  const addRow = () => {
    onChange([...value, blank()]);
  };

  if (!isEduConfigured) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 6,
          border: "1px solid var(--ent-danger)",
          background: "var(--ent-danger-bg)",
          color: "var(--ent-danger)",
          padding: "6px 8px",
          fontSize: 11,
        }}
      >
        <AlertCircle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0 }}>
          <code
            style={{
              background: "rgba(193,53,44,0.12)",
              padding: "0 4px",
              fontFamily: "var(--ent-font-mono)",
            }}
          >
            VITE_EDUSYSTEM_CORE_URL
          </code>{" "}
          sozlanmagan — biriktirish uchun .env'da uni o'rnating.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <GraduationCap size={13} />
          <span>O'quv reja biriktirishlari</span>
          {value.length > 0 && <EntBadge variant="muted">{value.length}</EntBadge>}
        </div>
        <EntButton
          size="xs"
          onClick={addRow}
          disabled={disabled || isLoading}
        >
          <Plus size={11} />
          Biriktirish qo'shish
        </EntButton>
      </div>

      {hasError && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 6,
            border: "1px solid var(--ent-danger)",
            background: "var(--ent-danger-bg)",
            color: "var(--ent-danger)",
            padding: "5px 8px",
            fontSize: 11,
          }}
        >
          <AlertCircle size={11} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>edusystem-core'dan ma'lumot olishda xato. Qaytadan urinib ko'ring.</span>
        </div>
      )}

      {isLoading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            border: "1px dashed var(--ent-border)",
            padding: 10,
            fontSize: 11,
            color: "var(--ent-text-muted)",
          }}
        >
          <Loader2 size={12} className="animate-spin" />
          O'quv rejalar yuklanmoqda...
        </div>
      )}

      {!isLoading && value.length === 0 && (
        <div
          style={{
            border: "1px dashed var(--ent-border)",
            padding: 16,
            textAlign: "center",
            fontSize: 12,
            color: "var(--ent-text-muted)",
          }}
        >
          Hali biriktirish yo'q. Yuqoridagi tugma orqali qo'shing.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {value.map((row, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid var(--ent-border)",
              background: "var(--ent-surface-alt)",
              padding: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span
                className="ent-muted"
                style={{ fontSize: 11, fontWeight: 600 }}
              >
                Biriktirish #{idx + 1}
              </span>
              <EntButton
                size="icon"
                variant="danger"
                disabled={disabled}
                onClick={() => removeRow(idx)}
                title="O'chirish"
              >
                <Trash2 size={12} />
              </EntButton>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 110px 1fr",
                gap: 6,
              }}
            >
              <div>
                <div
                  className="ent-muted"
                  style={{ fontSize: 11, marginBottom: 2 }}
                >
                  O'quv reja
                </div>
                <SearchableSelect
                  value={row.curriculumId ? String(row.curriculumId) : ""}
                  onChange={(v) =>
                    updateRow(idx, { curriculumId: v ? Number(v) : "" })
                  }
                  disabled={disabled || isLoading || hasError}
                  options={curriculums.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                  }))}
                  placeholder="Tanlang"
                  searchPlaceholder="O'quv reja nomidan qidirish..."
                  emptyText="O'quv reja topilmadi"
                />
              </div>

              <div>
                <div
                  className="ent-muted"
                  style={{ fontSize: 11, marginBottom: 2 }}
                >
                  Semestr
                </div>
                <EntSelect
                  value={row.semester ? String(row.semester) : ""}
                  onChange={(e) =>
                    updateRow(idx, {
                      semester: e.target.value ? Number(e.target.value) : "",
                    })
                  }
                  disabled={disabled || isLoading || hasError}
                  style={{ width: "100%" }}
                >
                  <option value="">— tanlang —</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={String(s.value ?? s.id)}>
                      {s.name}
                    </option>
                  ))}
                </EntSelect>
              </div>

              <div>
                <div
                  className="ent-muted"
                  style={{ fontSize: 11, marginBottom: 2 }}
                >
                  Fan
                </div>
                <SearchableSelect
                  value={row.subjectId ? String(row.subjectId) : ""}
                  onChange={(v) =>
                    updateRow(idx, { subjectId: v ? Number(v) : "" })
                  }
                  disabled={
                    disabled || isLoading || hasError || subjects.length === 0
                  }
                  options={subjects.map((s) => ({
                    value: String(s.id),
                    label: s.name,
                  }))}
                  placeholder="Tanlang"
                  searchPlaceholder="Fan nomidan qidirish..."
                  emptyText="Fan topilmadi"
                />
              </div>
            </div>

            <div style={{ marginTop: 6 }}>
              <EntCheckbox
                checked={row.isMain}
                onChange={(v) => updateRow(idx, { isMain: v })}
                disabled={disabled}
                label="Asosiy darslik"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
