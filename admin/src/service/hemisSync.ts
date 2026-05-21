import $api from "@/http/axios";
import { IHemisSyncJob, IPagination } from "@/interface";

export interface SyncHistoryResp {
  items: IHemisSyncJob[];
  pagination: IPagination;
}

export const startHemisSync = async (): Promise<IHemisSyncJob> => {
  const { data } = await $api.post("/hemis-sync");
  return data;
};

export const fetchHemisSyncCurrent = async (): Promise<IHemisSyncJob | null> => {
  const { data } = await $api.get("/hemis-sync/current");
  return data || null;
};

export const fetchHemisSyncHistory = async (
  page = 1,
  limit = 20,
): Promise<SyncHistoryResp> => {
  const { data } = await $api.get("/hemis-sync/history", {
    params: { page, limit },
  });
  return data;
};

export const fetchHemisSyncJob = async (
  id: number,
): Promise<IHemisSyncJob> => {
  const { data } = await $api.get(`/hemis-sync/${id}`);
  return data;
};
