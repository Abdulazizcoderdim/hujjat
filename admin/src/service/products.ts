import $api from "@/http/axios";
import { ICurriculumTreeResponse } from "@/interface";

export const fetchCurriculumTree =
  async (): Promise<ICurriculumTreeResponse> => {
    const res = await $api.get("/products/curriculum-tree");
    return res.data;
  };

export const fetchProductsByCurriculumLink = async (params: {
  curriculumId: number;
  semester: number;
  subjectId: number;
  limit?: number;
}) => {
  const res = await $api.get("/products", {
    params: {
      status: "approved",
      curriculumId: params.curriculumId,
      semester: params.semester,
      subjectId: params.subjectId,
      limit: params.limit ?? 200,
    },
  });
  return res.data;
};

export interface BulkRegenerateResult {
  processed: number;
  succeeded: number;
  failed: number;
  remaining: number;
  errors: Array<{ id: number; name: string; reason: string }>;
}

export const regeneratePoster = async (id: number) => {
  const res = await $api.post(`/products/${id}/regenerate-poster`);
  return res.data;
};

export const regenerateMissingPosters = async (
  limit: number,
): Promise<BulkRegenerateResult> => {
  const res = await $api.post("/products/regenerate-missing-posters", null, {
    params: { limit },
  });
  return res.data;
};

export const getProducts = async (params: any) => {
  const res = await $api.get("/products", { params });
  return res.data;
};

export const getProductById = async (id: number) => {
  const res = await $api.get(`/products/${id}`);
  return res.data;
};

export const updateProduct = async (id: number, data: FormData) => {
  const res = await $api.patch(`/products/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const deleteProduct = async (id: number) => {
  const res = await $api.delete(`/products/${id}`);
  return res.data;
};

export const changeProductStatus = async (id: number, status: string) => {
  const res = await $api.patch(`/products/${id}/approve`, { status });
  return res.data;
};
