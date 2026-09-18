import $api from "@/http/axios";
import {
  IMyReview,
  IPublicReview,
  IReviewListResponse,
} from "@/interface";

export interface SubmitReviewPayload {
  productId: number;
  rating: number;
  comment: string;
}

export const submitReview = async (payload: SubmitReviewPayload) => {
  const { data } = await $api.post("/book-reviews", payload);
  return data;
};

export const fetchProductReviews = async (
  productId: number,
  params: { page?: number; limit?: number; sort?: "newest" | "helpful" } = {},
): Promise<IReviewListResponse<IPublicReview>> => {
  const { data } = await $api.get(`/book-reviews/product/${productId}`, {
    params,
  });
  return data;
};

export const fetchMyReviews = async (
  params: { page?: number; limit?: number } = {},
): Promise<IReviewListResponse<IMyReview>> => {
  const { data } = await $api.get("/book-reviews/me", { params });
  return data;
};

export const deleteMyReview = async (id: number) => {
  const { data } = await $api.delete(`/book-reviews/${id}`);
  return data;
};

export const toggleHelpful = async (id: number) => {
  const { data } = await $api.post(`/book-reviews/${id}/helpful`);
  return data as { id: number; helpfulCount: number; marked: boolean };
};
