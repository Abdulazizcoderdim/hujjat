import $api from "@/http/axios";
import {
  BookRequestStatus,
  IBookRequest,
  IBookRequestStats,
  IPagination,
} from "@/interface";

export interface BookRequestsResp {
  items: IBookRequest[];
  pagination: IPagination;
}

export interface BookRequestsFilter {
  status?: BookRequestStatus | "all";
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

const clean = (obj: Record<string, any>) => {
  const r: Record<string, any> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    r[k] = v;
  });
  return r;
};

export const fetchBookRequests = async (
  filters: BookRequestsFilter,
): Promise<BookRequestsResp> => {
  const { data } = await $api.get("/book-requests", {
    params: clean(filters),
  });
  return data;
};

export const fetchBookRequestStats = async (): Promise<IBookRequestStats> => {
  const { data } = await $api.get("/book-requests/stats");
  return data;
};

export const fetchBookRequestPendingCount = async (): Promise<number> => {
  const { data } = await $api.get("/book-requests/pending-count");
  return data?.count ?? 0;
};

export const fetchBookRequest = async (id: number): Promise<IBookRequest> => {
  const { data } = await $api.get(`/book-requests/${id}`);
  return data;
};

export const approveRequest = async (id: number, adminNote?: string) => {
  const { data } = await $api.patch(`/book-requests/${id}/approve`, {
    adminNote,
  });
  return data as IBookRequest;
};

export const rejectRequest = async (id: number, adminNote: string) => {
  const { data } = await $api.patch(`/book-requests/${id}/reject`, {
    adminNote,
  });
  return data as IBookRequest;
};

export const fulfillRequest = async (
  id: number,
  productId: number,
  adminNote?: string,
) => {
  const { data } = await $api.patch(`/book-requests/${id}/fulfill`, {
    productId,
    adminNote,
  });
  return data as IBookRequest;
};
