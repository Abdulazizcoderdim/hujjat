import { EntConfirmDialog, EntPage, EntToolbar } from "@/components/enterprise";
import { SingleUploadForm } from "@/components/SingleUploadForm";
import $api from "@/http/axios";
import { ICategory, IPagination } from "@/interface";
import { createProduct } from "@/service/uploadProduct";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface ResCategory {
  items: ICategory[];
  pagination: IPagination;
}

interface DuplicateInfo {
  id: number;
  name: string;
  author: string | null;
  year: number | null;
  shelfCode: string | null;
  udc: string | null;
  categoryName: string | null;
  uploadedBy: { id: number; full_name: string } | null;
  createdAt: string;
}

interface SimilarPrompt {
  existing: DuplicateInfo;
  retry: () => Promise<void>;
}

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

const UploadProductsPage = () => {
  const [similar, setSimilar] = useState<SimilarPrompt | null>(null);
  const [similarBusy, setSimilarBusy] = useState(false);

  const { data } = useQuery<ResCategory>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await $api.get("/categories/all");
      return res.data;
    },
    placeholderData: (prev) =>
      prev ?? {
        items: [],
        pagination: { total: 0, page: 1, limit: 100, totalPages: 1 },
      },
  });

  const runUpload = async (
    formData: FormData,
    onProgress: (percent: number) => void,
    force: boolean,
  ) => {
    const file = formData.get("file") as File | null;
    const posterEntry = formData.get("poster");
    const poster = posterEntry instanceof File ? posterEntry : null;

    if (!file) {
      toast.error("Fayl tanlanmagan");
      throw new Error("missing file");
    }

    return createProduct({
      file,
      poster,
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      categoryId: String(formData.get("categoryId") || ""),
      tags: String(formData.get("tags") || ""),
      pages: String(formData.get("pages") || ""),
      author: String(formData.get("author") || ""),
      year: String(formData.get("year") || ""),
      language: String(formData.get("language") || ""),
      shelfCode: String(formData.get("shelfCode") || ""),
      udc: String(formData.get("udc") || ""),
      isCurriculumBook: String(formData.get("isCurriculumBook") || "false"),
      curriculumLinks: String(formData.get("curriculumLinks") || ""),
      force,
      onProgress,
    });
  };

  const handleSingleUpload = async (
    formData: FormData,
    onProgress: (percent: number) => void,
  ) => {
    try {
      const product = await runUpload(formData, onProgress, false);
      toast.success(`"${product.name}" muvaffaqiyatli saqlandi`);
    } catch (err: any) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      if (status === 409 && body?.kind === "exact" && body?.existing) {
        const ex: DuplicateInfo = body.existing;
        toast.error(
          `Bu fayl allaqachon yuklangan: "${ex.name}"${
            ex.author ? ` — ${ex.author}` : ""
          }${ex.uploadedBy ? ` (yukladi: ${ex.uploadedBy.full_name})` : ""}`,
          { duration: 8000 },
        );
        throw err;
      }
      if (status === 409 && body?.kind === "similar" && body?.existing) {
        setSimilar({
          existing: body.existing,
          retry: async () => {
            const product = await runUpload(formData, onProgress, true);
            toast.success(`"${product.name}" saqlandi`);
          },
        });
        throw err;
      }
      const msg = body?.message;
      toast.error(
        Array.isArray(msg) ? msg.join(", ") : msg || "Yuklashda xatolik",
      );
      throw err;
    }
  };

  return (
    <EntPage>
      <EntToolbar title="Hujjat yuklash" />
      <div style={{ padding: 6 }}>
        <SingleUploadForm
          categories={data?.items ?? []}
          onSubmit={handleSingleUpload}
        />
      </div>

      <EntConfirmDialog
        open={!!similar}
        title="Bunday kitob bormi?"
        confirmLabel="Baribir yuklash"
        cancelLabel="Bekor qilish"
        busy={similarBusy}
        onClose={() => !similarBusy && setSimilar(null)}
        onConfirm={async () => {
          if (!similar) return;
          setSimilarBusy(true);
          try {
            await similar.retry();
            setSimilar(null);
          } catch {
            // toast already shown by inner handler
          } finally {
            setSimilarBusy(false);
          }
        }}
        message={
          similar && (
            <div>
              <p style={{ marginBottom: 8 }}>
                Shu nom va muallifli kitob allaqachon mavjud. Baribir yangi
                nusxa sifatida yuklamoqchimisiz?
              </p>
              <div
                style={{
                  border: "1px solid var(--ent-border)",
                  padding: 8,
                  background: "var(--ent-bg)",
                  fontSize: 12,
                  lineHeight: 1.7,
                }}
              >
                <div>
                  <strong>Nom:</strong> {similar.existing.name}
                </div>
                {similar.existing.author && (
                  <div>
                    <strong>Muallif:</strong> {similar.existing.author}
                  </div>
                )}
                {similar.existing.year && (
                  <div>
                    <strong>Yil:</strong> {similar.existing.year}
                  </div>
                )}
                {similar.existing.shelfCode && (
                  <div>
                    <strong>Shifr:</strong> {similar.existing.shelfCode}
                  </div>
                )}
                {similar.existing.uploadedBy && (
                  <div>
                    <strong>Yukladi:</strong>{" "}
                    {similar.existing.uploadedBy.full_name}
                  </div>
                )}
                <div>
                  <strong>Sana:</strong> {fmtDate(similar.existing.createdAt)}
                </div>
              </div>
            </div>
          )
        }
      />
    </EntPage>
  );
};

export default UploadProductsPage;
