import $api from "@/http/axios";
import {
  IAdminBookReview,
  IPagination,
  IReviewStats,
  ReviewStatus,
} from "@/interface";

export interface AdminReviewsFilters {
  status?: ReviewStatus | "all";
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminReviewsResponse {
  items: IAdminBookReview[];
  pagination: IPagination;
}

export const fetchPendingReviewCount = async () => {
  const { data } = await $api.get<{ count: number }>(
    "/book-reviews/pending-count",
  );
  return data.count;
};

export const fetchReviewStats = async (): Promise<IReviewStats> => {
  const { data } = await $api.get("/book-reviews/admin/stats");
  return data;
};

export const fetchAdminReviews = async (
  filters: AdminReviewsFilters,
): Promise<AdminReviewsResponse> => {
  const params: Record<string, string | number> = {};
  if (filters.status && filters.status !== "all") params.status = filters.status;
  if (filters.search?.trim()) params.search = filters.search.trim();
  params.page = filters.page ?? 1;
  params.limit = filters.limit ?? 20;
  const { data } = await $api.get("/book-reviews/admin", { params });
  return data;
};

export const approveReview = async (id: number) => {
  const { data } = await $api.patch(`/book-reviews/${id}/approve`);
  return data;
};

export const rejectReview = async (id: number, modNote: string) => {
  const { data } = await $api.patch(`/book-reviews/${id}/reject`, { modNote });
  return data;
};

export const deleteReview = async (id: number) => {
  const { data } = await $api.delete(`/book-reviews/${id}`);
  return data;
};
