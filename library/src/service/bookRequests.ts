import $api from "@/http/axios";
import { IBookRequest } from "@/interface";

export interface CreateBookRequestPayload {
  title: string;
  author?: string;
  description?: string;
  reason?: string;
}

export const createBookRequest = async (
  payload: CreateBookRequestPayload,
): Promise<IBookRequest> => {
  const { data } = await $api.post("/book-requests", payload);
  return data;
};

export const fetchMyRequests = async (): Promise<IBookRequest[]> => {
  const { data } = await $api.get("/book-requests/me");
  return data;
};

export const cancelRequest = async (id: number) => {
  const { data } = await $api.delete(`/book-requests/${id}/me`);
  return data;
};
