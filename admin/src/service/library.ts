import $api from "@/http/axios";
import {
  ICatalogProduct,
  ILoan,
  ILoanUser,
  IPagination,
} from "@/interface";

export interface CatalogResponse {
  items: ICatalogProduct[];
  pagination: IPagination;
}

export interface LoansResponse {
  items: ILoan[];
  pagination: IPagination;
}

export interface CatalogFilters {
  search?: string;
  shelfCode?: string;
  udc?: string;
  availability?: "all" | "available" | "borrowed";
  category?: number;
  page?: number;
  limit?: number;
}

export const fetchCatalog = async (
  filters: CatalogFilters,
): Promise<CatalogResponse> => {
  const params: Record<string, string | number> = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.shelfCode?.trim()) params.shelfCode = filters.shelfCode.trim();
  if (filters.udc?.trim()) params.udc = filters.udc.trim();
  if (filters.availability && filters.availability !== "all")
    params.availability = filters.availability;
  if (filters.category) params.category = filters.category;
  params.page = filters.page ?? 1;
  params.limit = filters.limit ?? 25;
  const { data } = await $api.get("/products/library/catalog", { params });
  return data;
};

export interface LendPayload {
  productId: number;
  userId: number;
  dueAt?: string;
  notes?: string;
}

export const createLoan = async (payload: LendPayload): Promise<ILoan> => {
  const { data } = await $api.post("/loans", payload);
  return data;
};

export const returnLoan = async (loanId: number): Promise<ILoan> => {
  const { data } = await $api.post(`/loans/${loanId}/return`);
  return data;
};

export interface LoansFilters {
  status?: "active" | "overdue" | "returned" | "all";
  search?: string;
  page?: number;
  limit?: number;
}

export const fetchLoans = async (
  filters: LoansFilters,
): Promise<LoansResponse> => {
  const params: Record<string, string | number> = {};
  if (filters.status) params.status = filters.status;
  if (filters.search?.trim()) params.search = filters.search.trim();
  params.page = filters.page ?? 1;
  params.limit = filters.limit ?? 25;
  const { data } = await $api.get("/loans", { params });
  return data;
};

export interface StudentsResponse {
  items: ILoanUser[];
  pagination: IPagination;
}

export const fetchStudents = async (
  search: string,
  limit = 10,
): Promise<StudentsResponse> => {
  const { data } = await $api.get("/users/role/student", {
    params: { search, page: 1, limit },
  });
  return data;
};
