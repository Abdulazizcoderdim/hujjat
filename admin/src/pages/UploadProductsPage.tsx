import { SingleUploadForm } from "@/components/SingleUploadForm";
import $api from "@/http/axios";
import { ICategory, IPagination } from "@/interface";
import { createProduct } from "@/service/uploadProduct";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface ResCategory {
  items: ICategory[];
  pagination: IPagination;
}

const UploadProductsPage = () => {
  const { data } = useQuery<ResCategory>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await $api.get("/categories", { params: { limit: 100 } });
      return res.data;
    },
    placeholderData: (prev) =>
      prev ?? {
        items: [],
        pagination: { total: 0, page: 1, limit: 100, totalPages: 1 },
      },
  });

  const handleSingleUpload = async (
    formData: FormData,
    onProgress: (percent: number) => void,
  ) => {
    try {
      const file = formData.get("file") as File | null;
      const posterEntry = formData.get("poster");
      const poster = posterEntry instanceof File ? posterEntry : null;

      if (!file) {
        toast.error("Fayl tanlanmagan");
        throw new Error("missing file");
      }

      const product = await createProduct({
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
        onProgress,
      });

      toast.success(`"${product.name}" muvaffaqiyatli saqlandi ✅`);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(
        Array.isArray(msg) ? msg.join(", ") : msg || "Yuklashda xatolik",
      );
      throw err;
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Hujjat yuklash
        </h1>
        <p className="text-sm text-muted-foreground">
          Yangi kitob yoki hujjatni kutubxonaga qo'shing. Majburiy maydonlar{" "}
          <span className="text-destructive">*</span> bilan belgilangan.
        </p>
      </header>

      <SingleUploadForm
        categories={data?.items ?? []}
        onSubmit={handleSingleUpload}
      />
    </div>
  );
};

export default UploadProductsPage;
