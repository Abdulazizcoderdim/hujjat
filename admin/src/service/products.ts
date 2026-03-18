import $api from "@/http/axios";

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
