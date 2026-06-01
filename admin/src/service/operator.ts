import $api from "@/http/axios";
import {
  ICategory,
  IOperatorDetail,
  IOperatorListItem,
  IPagination,
  IProduct,
} from "@/interface";

export interface MyUploadsResp {
  items: IProduct<ICategory>[];
  pagination: IPagination;
}

export const fetchMyUploads = async (
  page = 1,
  limit = 25,
  search?: string,
): Promise<MyUploadsResp> => {
  const params: Record<string, string | number> = { page, limit };
  if (search?.trim()) params.search = search.trim();
  const { data } = await $api.get("/products/uploaded-by-me", { params });
  return data;
};

export const fetchOperators = async (): Promise<IOperatorListItem[]> => {
  const { data } = await $api.get("/audit/operators");
  return data;
};

export const fetchOperator = async (id: number): Promise<IOperatorDetail> => {
  const { data } = await $api.get(`/audit/operators/${id}`);
  return data;
};

export const fetchOperatorChart = async (
  id: number,
  days = 30,
): Promise<{ day: string; count: number }[]> => {
  const { data } = await $api.get(`/audit/operators/${id}/chart`, {
    params: { days },
  });
  return data;
};

export const createOperator = async (payload: {
  full_name: string;
  email?: string;
  login?: string;
  phone?: string;
  password: string;
}) => {
  const { data } = await $api.post("/users/create-operator", payload);
  return data;
};
