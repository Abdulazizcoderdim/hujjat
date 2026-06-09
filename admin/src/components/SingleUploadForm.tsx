import {
  CurriculumLinkValue,
  CurriculumLinksFieldset,
} from "@/components/CurriculumLinksFieldset";
import {
  EntBadge,
  EntButton,
  EntCard,
  EntCheckbox,
  EntField,
  EntInput,
  EntSelect,
  EntTextarea,
} from "@/components/enterprise";
import { ICategory } from "@/interface";
import {
  AlertCircle,
  FileText,
  GraduationCap,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

const ALLOWED_DOC_EXT = [".pdf"];
const MAX_DOC_SIZE_MB = 200;
const MAX_POSTER_SIZE_MB = 10;

interface Props {
  categories: ICategory[];
  onSubmit: (
    data: FormData,
    onProgress: (percent: number) => void,
  ) => Promise<void> | void;
}

const initialForm = {
  name: "",
  description: "",
  categoryId: "",
  tags: "",
  pages: "",
  author: "",
  year: "",
  language: "",
  shelfCode: "",
  udc: "",
};
type FormState = typeof initialForm;
type Errors = Partial<Record<keyof FormState | "file" | "poster", string>>;

const fmtBytes = (b: number) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
};

export function SingleUploadForm({ categories, onSubmit }: Props) {
  const [file, setFile] = useState<File | null>(null);
  // Poster va sahifalar soni UI'dan olib tashlandi — PDF'dan avtomatik to'ldiriladi
  const [poster, setPoster] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [isFileDragging, setIsFileDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCurriculumBook, setIsCurriculumBook] = useState(false);
  const [curriculumLinks, setCurriculumLinks] = useState<CurriculumLinkValue[]>(
    [],
  );

  const fileInputRef = useRef<HTMLInputElement>(null);


  const validateDocument = (f: File | null) => {
    if (!f) return null;
    const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_DOC_EXT.includes(ext)) return "Faqat PDF qabul qilinadi";
    if (f.size > MAX_DOC_SIZE_MB * 1024 * 1024)
      return `Fayl hajmi ${MAX_DOC_SIZE_MB}MB dan oshmasligi kerak`;
    return null;
  };
  const validatePoster = (f: File | null) => {
    if (!f) return null;
    if (!f.type.startsWith("image/")) return "Faqat rasm fayli qabul qilinadi";
    if (f.size > MAX_POSTER_SIZE_MB * 1024 * 1024)
      return `Rasm hajmi ${MAX_POSTER_SIZE_MB}MB dan oshmasligi kerak`;
    return null;
  };
  const applyFile = (f: File | null) => {
    const err = validateDocument(f);
    setErrors((prev) => ({ ...prev, file: err || undefined }));
    if (err) return;
    setFile(f);
  };
  const applyPoster = (f: File | null) => {
    const err = validatePoster(f);
    setErrors((prev) => ({ ...prev, poster: err || undefined }));
    if (err) return;
    setPoster(f);
  };

  const linkErrors = useMemo(() => {
    if (!isCurriculumBook) return null;
    if (curriculumLinks.length === 0)
      return "Kamida bitta biriktirish qo'shing yoki tickni olib tashlang";
    const seen = new Set<string>();
    for (const l of curriculumLinks) {
      if (!l.curriculumId || !l.semester || !l.subjectId)
        return "Har bir biriktirishda o'quv reja, semestr va fan tanlanishi kerak";
      const key = `${l.curriculumId}-${l.semester}-${l.subjectId}`;
      if (seen.has(key)) return "Bir xil biriktirish takrorlangan";
      seen.add(key);
    }
    return null;
  }, [isCurriculumBook, curriculumLinks]);

  const validateAll = (): boolean => {
    const next: Errors = {};
    if (!file) next.file = "Fayl tanlanmagan";
    if (!formData.name.trim()) next.name = "Hujjat nomini kiriting";
    if (!formData.description.trim()) next.description = "Tavsifni kiriting";
    if (!formData.categoryId) next.categoryId = "Kategoriya tanlang";
    if (formData.year) {
      const y = Number(formData.year);
      const max = new Date().getFullYear() + 1;
      if (y < 1000 || y > max)
        next.year = `Yil 1000–${max} oralig'ida bo'lishi kerak`;
    }
    if (formData.pages && Number(formData.pages) < 1) {
      next.pages = "Sahifa soni 1 dan kam bo'lmasin";
    }
    setErrors(next);
    return Object.keys(next).length === 0 && !linkErrors;
  };

  const handleReset = () => {
    setFile(null);
    setPoster(null);
    setFormData(initialForm);
    setErrors({});
    setIsFileDragging(false);
    setIsCurriculumBook(false);
    setCurriculumLinks([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    if (!validateAll()) return;
    setIsUploading(true);
    setProgress(0);
    try {
      const data = new FormData();
      data.append("file", file!);
      if (poster) data.append("poster", poster);
      data.append("name", formData.name.trim());
      data.append("description", formData.description.trim());
      data.append("categoryId", formData.categoryId);
      data.append("tags", formData.tags);
      data.append("pages", formData.pages);
      data.append("author", formData.author);
      data.append("year", formData.year);
      data.append("language", formData.language);
      data.append("shelfCode", formData.shelfCode);
      data.append("udc", formData.udc);
      data.append("isCurriculumBook", String(isCurriculumBook));
      if (isCurriculumBook && curriculumLinks.length) {
        data.append(
          "curriculumLinks",
          JSON.stringify(
            curriculumLinks.map((l) => ({
              curriculumId: Number(l.curriculumId),
              semester: Number(l.semester),
              subjectId: Number(l.subjectId),
              isMain: l.isMain,
            })),
          ),
        );
      }
      await onSubmit(data, (p) => setProgress(p));
      setProgress(100);
      handleReset();
    } catch {
      // parent shows toast
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 400);
    }
  };

  const tagsList = useMemo(
    () =>
      formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [formData.tags],
  );

  const onFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsFileDragging(false);
    if (isUploading) return;
    const f = e.dataTransfer.files[0];
    if (f) applyFile(f);
  };
  // Dropzone styles inline
  const dzBaseStyle: React.CSSProperties = {
    border: "1px dashed var(--ent-border-strong)",
    background: "var(--ent-bg)",
    padding: 10,
    cursor: "pointer",
    minHeight: 80,
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  return (
    <form onSubmit={handleSubmit} className="ent-stack-y">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Document + metadata (single column) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <EntCard
            title={
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                <FileText size={13} />
                Hujjat fayli <span style={{ color: "var(--ent-danger)" }}>*</span>
              </span>
            }
          >
            <div
              role="button"
              tabIndex={isUploading ? -1 : 0}
              onDragOver={(e) => {
                e.preventDefault();
                setIsFileDragging(true);
              }}
              onDragLeave={() => setIsFileDragging(false)}
              onDrop={onFileDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              style={{
                ...dzBaseStyle,
                borderColor: errors.file
                  ? "var(--ent-danger)"
                  : isFileDragging
                    ? "var(--ent-accent)"
                    : "var(--ent-border-strong)",
                background: errors.file
                  ? "var(--ent-danger-bg)"
                  : isFileDragging
                    ? "var(--ent-accent-soft)"
                    : "var(--ent-bg)",
                pointerEvents: isUploading ? "none" : "auto",
                opacity: isUploading ? 0.7 : 1,
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept={ALLOWED_DOC_EXT.join(",")}
                onChange={(e) => applyFile(e.target.files?.[0] || null)}
                disabled={isUploading}
              />
              {file ? (
                <>
                  <FileText size={28} style={{ color: "var(--ent-accent)" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500 }}>{file.name}</div>
                    <div className="ent-muted" style={{ fontSize: 11 }}>
                      {fmtBytes(file.size)}
                    </div>
                  </div>
                  <EntButton
                    size="icon"
                    variant="danger"
                    disabled={isUploading}
                    onClick={(e) => {
                      e.stopPropagation();
                      applyFile(null);
                    }}
                  >
                    <X size={14} />
                  </EntButton>
                </>
              ) : (
                <>
                  <Upload size={20} style={{ color: "var(--ent-text-muted)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>
                      Faylni shu yerga tashlang yoki tanlash uchun bosing
                    </div>
                    <div className="ent-muted" style={{ fontSize: 11 }}>
                      Faqat PDF — maks. {MAX_DOC_SIZE_MB}MB
                    </div>
                  </div>
                </>
              )}
            </div>
            {errors.file && (
              <div
                style={{
                  color: "var(--ent-danger)",
                  fontSize: 11,
                  marginTop: 4,
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                }}
              >
                <AlertCircle size={11} /> {errors.file}
              </div>
            )}
            {isUploading && (
              <div style={{ marginTop: 6 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                  }}
                >
                  <span>Yuklanmoqda...</span>
                  <span className="ent-cell--code">{progress}%</span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "var(--ent-bg)",
                    border: "1px solid var(--ent-border)",
                    marginTop: 3,
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: "100%",
                      background: "var(--ent-accent)",
                      transition: "width 200ms",
                    }}
                  />
                </div>
              </div>
            )}
          </EntCard>

          <EntCard title="Asosiy ma'lumotlar">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <EntField
                label="Hujjat nomi"
                required
                error={errors.name}
                htmlFor="name"
              >
                <EntInput
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={isUploading}
                  required
                  autoComplete="off"
                />
              </EntField>
              <EntField
                label="Tavsif"
                required
                error={errors.description}
                hint={
                  !errors.description
                    ? "Foydalanuvchilarga hujjat mazmunini tushunishga yordam beradi"
                    : undefined
                }
              >
                <EntTextarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={isUploading}
                  required
                />
              </EntField>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <EntField
                  label="Kategoriya"
                  required
                  error={errors.categoryId}
                >
                  <EntSelect
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    disabled={isUploading}
                    required
                  >
                    <option value="">— tanlang —</option>
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.icon ? `${c.icon} ` : ""}
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>Kategoriya mavjud emas</option>
                    )}
                  </EntSelect>
                </EntField>
                <EntField label="Javon raqami (shifr)">
                  <EntInput
                    mono
                    value={formData.shelfCode}
                    onChange={(e) =>
                      setFormData({ ...formData, shelfCode: e.target.value })
                    }
                    placeholder="728.4"
                    disabled={isUploading}
                    maxLength={64}
                  />
                </EntField>
                <EntField
                  label="UDK (Universal Decimal Classification)"
                  hint="masalan: 04.34 — mavzu bo'yicha klassifikatsiya"
                >
                  <EntInput
                    mono
                    value={formData.udc}
                    onChange={(e) =>
                      setFormData({ ...formData, udc: e.target.value })
                    }
                    placeholder="04.34"
                    disabled={isUploading}
                    maxLength={32}
                  />
                </EntField>
              </div>
            </div>
          </EntCard>

          <EntCard title="Qo'shimcha ma'lumotlar">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <EntField label="Muallif">
                <EntInput
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  placeholder="Abdulla Qodiriy"
                  disabled={isUploading}
                  autoComplete="off"
                />
              </EntField>
              <EntField label="Til">
                <EntInput
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  placeholder="O'zbekcha"
                  disabled={isUploading}
                  autoComplete="off"
                />
              </EntField>
              <EntField label="Nashr yili" error={errors.year}>
                <EntInput
                  type="number"
                  inputMode="numeric"
                  min={1000}
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  placeholder="2024"
                  disabled={isUploading}
                />
              </EntField>
              <EntField label="Kalit so'zlar" className="ent-grid--2" hint="vergul bilan ajrating">
                <EntInput
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="roman, klassik, adabiyot"
                  disabled={isUploading}
                  autoComplete="off"
                />
              </EntField>
            </div>
            {tagsList.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 3,
                  marginTop: 6,
                }}
              >
                {tagsList.map((t, i) => (
                  <EntBadge key={`${t}-${i}`} variant="muted">
                    {t}
                  </EntBadge>
                ))}
              </div>
            )}
          </EntCard>
        </div>
      </div>

      {/* Curriculum — full-width row */}
      <EntCard
        title={
          <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <GraduationCap size={13} /> O'quv reja kitobimi?
          </span>
        }
        actions={
          <EntCheckbox
            checked={isCurriculumBook}
            onChange={(v) => {
              setIsCurriculumBook(v);
              if (!v) setCurriculumLinks([]);
            }}
            disabled={isUploading}
            label={
              <EntBadge variant={isCurriculumBook ? "success" : "muted"}>
                {isCurriculumBook ? "Ha" : "Yo'q"}
              </EntBadge>
            }
          />
        }
      >
        {isCurriculumBook ? (
          <>
            <CurriculumLinksFieldset
              value={curriculumLinks}
              onChange={setCurriculumLinks}
              disabled={isUploading}
            />
            {linkErrors && (
              <div
                style={{
                  color: "var(--ent-danger)",
                  fontSize: 11,
                  marginTop: 6,
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                }}
                role="alert"
              >
                <AlertCircle size={11} /> {linkErrors}
              </div>
            )}
          </>
        ) : (
          <div
            className="ent-muted"
            style={{ fontSize: 12, padding: "4px 0" }}
          >
            Sillabusda berilgan o'quv reja kitobi bo'lsa, "Ha" deb belgilang.
          </div>
        )}
      </EntCard>

      {/* Action bar */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "var(--ent-surface)",
          borderTop: "1px solid var(--ent-border-strong)",
          padding: "6px 8px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {isUploading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flex: 1,
              minWidth: 0,
            }}
          >
            <span style={{ fontSize: 12 }} className="ent-muted">
              Yuklanmoqda
            </span>
            <div
              style={{
                flex: 1,
                maxWidth: 240,
                height: 6,
                border: "1px solid var(--ent-border)",
                background: "var(--ent-bg)",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "var(--ent-accent)",
                  transition: "width 200ms",
                }}
              />
            </div>
            <span className="ent-cell--code" style={{ fontSize: 12 }}>
              {progress}%
            </span>
          </div>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <EntButton disabled={isUploading} onClick={handleReset}>
            Tozalash
          </EntButton>
          <EntButton
            type="submit"
            variant="primary"
            disabled={isUploading}
            style={{ minWidth: 120 }}
          >
            {isUploading ? `Yuklanmoqda ${progress}%` : "Yuklash"}
          </EntButton>
        </div>
      </div>
    </form>
  );
}
