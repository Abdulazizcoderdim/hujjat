import {
  CurriculumLinkValue,
  CurriculumLinksFieldset,
} from "@/components/CurriculumLinksFieldset";
import {
  EntBadge,
  EntButton,
  EntCheckbox,
  EntDrawer,
  EntField,
  EntInput,
  EntSelect,
  EntTextarea,
} from "@/components/enterprise";
import $api from "@/http/axios";
import { ICategory, ICurriculumLink } from "@/interface";
import { fetchCurriculumLinks } from "@/service/edusystem";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, GraduationCap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Props {
  id: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
}

export function EditProductModal({ id, isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);
  const [poster, setPoster] = useState<File | null>(null);
  const [isCurriculumBook, setIsCurriculumBook] = useState(false);
  const [curriculumLinks, setCurriculumLinks] = useState<CurriculumLinkValue[]>(
    [],
  );

  const { data: categories } = useQuery({
    queryKey: ["categories-list"],
    queryFn: async () =>
      (await $api.get("/categories", { params: { limit: 100 } })).data,
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ["product-detail", id],
    queryFn: async () => (await $api.get(`/products/${id}`)).data,
    enabled: !!id && isOpen,
  });

  const { data: existingLinks } = useQuery<ICurriculumLink[]>({
    queryKey: ["product-curriculum-links", id],
    queryFn: () => fetchCurriculumLinks(id!),
    enabled: !!id && isOpen,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        categoryId: String(product.category?.id ?? ""),
        tags: product.tags?.join(", ") ?? "",
        shelfCode: product.shelfCode ?? "",
        udc: product.udc ?? "",
        author: product.author ?? "",
        pages: product.pages ?? "",
        year: product.year ?? "",
        language: product.language ?? "",
      });
      setIsCurriculumBook(!!product.isCurriculumBook);
      setFile(null);
      setPoster(null);
    }
  }, [product]);

  useEffect(() => {
    if (existingLinks) {
      setCurriculumLinks(
        existingLinks.map((l) => ({
          curriculumId: l.curriculumId,
          semester: l.semester,
          subjectId: l.subjectId,
          isMain: l.isMain,
        })),
      );
    }
  }, [existingLinks]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkErrors) return;
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") data.append(k, String(v));
    });
    if (file) data.append("file", file);
    if (poster) data.append("poster", poster);
    data.append("isCurriculumBook", String(isCurriculumBook));
    data.append(
      "curriculumLinks",
      isCurriculumBook && curriculumLinks.length
        ? JSON.stringify(
            curriculumLinks.map((l) => ({
              curriculumId: Number(l.curriculumId),
              semester: Number(l.semester),
              subjectId: Number(l.subjectId),
              isMain: l.isMain,
            })),
          )
        : "[]",
    );
    onSave(data);
  };

  return (
    <EntDrawer
      open={isOpen}
      onClose={onClose}
      title="Mahsulotni tahrirlash"
      width={640}
      footer={
        <>
          <EntButton onClick={onClose}>Bekor qilish</EntButton>
          <EntButton
            variant="primary"
            disabled={!!linkErrors}
            onClick={(e) => handleSubmit(e as any)}
          >
            Saqlash
          </EntButton>
        </>
      }
    >
      {isLoading || !product ? (
        <div className="ent-empty" style={{ border: 0 }}>
          Yuklanmoqda...
        </div>
      ) : (
        <form className="ent-stack-y" onSubmit={handleSubmit}>
          <EntField label="Nom" required>
            <EntInput
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </EntField>

          <EntField label="Tavsif" required>
            <EntTextarea
              rows={3}
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
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
            <EntField label="Kategoriya" required>
              <EntSelect
                value={formData.categoryId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                required
              >
                <option value="">— tanlang —</option>
                {categories?.items?.map((c: ICategory) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </EntSelect>
            </EntField>

            <EntField label="Javon raqami (shifr)">
              <EntInput
                mono
                value={formData.shelfCode || ""}
                onChange={(e) =>
                  setFormData({ ...formData, shelfCode: e.target.value })
                }
                placeholder="728.4"
                maxLength={64}
              />
            </EntField>

            <EntField label="UDK (Universal Decimal Classification)">
              <EntInput
                mono
                value={formData.udc || ""}
                onChange={(e) =>
                  setFormData({ ...formData, udc: e.target.value })
                }
                placeholder="04.34"
                maxLength={32}
              />
            </EntField>

            <EntField label="Muallif">
              <EntInput
                value={formData.author || ""}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
              />
            </EntField>

            <EntField label="Til">
              <EntInput
                value={formData.language || ""}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
              />
            </EntField>

            <EntField label="Sahifalar soni">
              <EntInput
                type="number"
                value={formData.pages || ""}
                onChange={(e) =>
                  setFormData({ ...formData, pages: e.target.value })
                }
              />
            </EntField>

            <EntField label="Nashr yili">
              <EntInput
                type="number"
                value={formData.year || ""}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
              />
            </EntField>
          </div>

          <EntField label="Teglar (vergul bilan)">
            <EntInput
              value={formData.tags || ""}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="masalan: roman, klassik"
            />
          </EntField>

          <div
            style={{
              borderTop: "1px solid var(--ent-border)",
              paddingTop: 8,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            <EntField label="Yangi hujjat fayli (ixtiyoriy)">
              <input
                type="file"
                className="ent-input"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{ padding: 2 }}
              />
            </EntField>
            <EntField label="Yangi poster (ixtiyoriy)">
              <input
                type="file"
                className="ent-input"
                accept="image/*"
                onChange={(e) => setPoster(e.target.files?.[0] || null)}
                style={{ padding: 2 }}
              />
            </EntField>
          </div>

          {/* Curriculum block */}
          <div
            style={{
              borderTop: "1px solid var(--ent-border)",
              paddingTop: 8,
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
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <GraduationCap size={14} />
                O'quv reja kitobi
              </div>
              <EntCheckbox
                checked={isCurriculumBook}
                onChange={(v) => {
                  setIsCurriculumBook(v);
                  if (!v) setCurriculumLinks([]);
                }}
                label={
                  <EntBadge variant={isCurriculumBook ? "success" : "muted"}>
                    {isCurriculumBook ? "Ha" : "Yo'q"}
                  </EntBadge>
                }
              />
            </div>

            {isCurriculumBook && (
              <>
                <CurriculumLinksFieldset
                  value={curriculumLinks}
                  onChange={setCurriculumLinks}
                />
                {linkErrors && (
                  <p
                    style={{
                      display: "flex",
                      gap: 4,
                      alignItems: "center",
                      color: "var(--ent-danger)",
                      fontSize: 11,
                      marginTop: 4,
                    }}
                    role="alert"
                  >
                    <AlertCircle size={12} /> {linkErrors}
                  </p>
                )}
              </>
            )}
          </div>

          <button type="submit" style={{ display: "none" }} />
        </form>
      )}
    </EntDrawer>
  );
}
