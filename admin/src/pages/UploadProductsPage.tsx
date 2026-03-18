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
    data: FormData,
    onProgress: (percent: number) => void,
  ) => {
    try {
      const file = data.get("file") as File;
      const poster = data.get("poster") as File;
      const name = String(data.get("name") || "");
      const description = String(data.get("description") || "");
      const categoryId = String(data.get("categoryId") || "");
      const tags = String(data.get("tags") || "");
      const pages = String(data.get("pages") || "");
      const author = String(data.get("author") || "");
      const year = String(data.get("year") || "");
      const language = String(data.get("language") || "");

      await createProduct({
        file,
        poster,
        name,
        description,
        categoryId,
        tags,
        pages,
        author,
        year,
        language,
        onProgress,
      });

      toast.success("Mahsulot va hujjat muvaffaqiyatli saqlandi ✅");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Upload xatolik");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Hujjat yuklash</h1>
      </div>

      <div className="mt-6">
        <SingleUploadForm
          categories={data.items}
          onSubmit={handleSingleUpload}
        />
      </div>
    </div>
  );
};

export default UploadProductsPage;
