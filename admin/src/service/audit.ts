import $api from "@/http/axios";
import {
  AdminActionType,
  AdminTargetType,
  IAdminAction,
  ILoginEvent,
  IPagination,
  IReadingSessionAdmin,
  LoginEventMethod,
  LoginEventStatus,
} from "@/interface";

const clean = (obj: Record<string, any>) => {
  const r: Record<string, any> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    r[k] = v;
  });
  return r;
};

/* ===== Login events ===== */

export interface LoginsResp {
  items: ILoginEvent[];
  pagination: IPagination;
}

export interface LoginsFilter {
  status?: LoginEventStatus;
  method?: LoginEventMethod;
  userId?: number;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const fetchLogins = async (
  filters: LoginsFilter,
): Promise<LoginsResp> => {
  const { data } = await $api.get("/audit/logins", { params: clean(filters) });
  return data;
};

export interface LoginStatsResp {
  from: string;
  to: string;
  total: number;
  success: number;
  failed: number;
  byMethod: { method: LoginEventMethod; count: number }[];
  topIps: { ip: string; count: number }[];
}

export const fetchLoginStats = async (
  from?: string,
  to?: string,
): Promise<LoginStatsResp> => {
  const { data } = await $api.get("/audit/logins/stats", {
    params: clean({ from, to }),
  });
  return data;
};

/* ===== Reading sessions ===== */

export interface SessionsResp {
  items: IReadingSessionAdmin[];
  pagination: IPagination;
}

export interface SessionsFilter {
  userId?: number;
  productId?: number;
  open?: boolean;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const fetchSessions = async (
  filters: SessionsFilter,
): Promise<SessionsResp> => {
  const { data } = await $api.get("/audit/sessions", {
    params: clean(filters),
  });
  return data;
};

export const fetchSession = async (id: number) => {
  const { data } = await $api.get(`/audit/sessions/${id}`);
  return data as IReadingSessionAdmin;
};

export interface SessionStatsResp {
  from: string;
  to: string;
  totalSessions: number;
  totalSeconds: number;
  avgSeconds: number;
  openSessions: number;
  topBooks: {
    productId: number;
    name: string;
    author: string | null;
    sessions: number;
    seconds: number;
  }[];
  topReaders: {
    userId: number;
    full_name: string | null;
    login: string | null;
    group: string | null;
    sessions: number;
    seconds: number;
  }[];
}

export const fetchSessionStats = async (
  from?: string,
  to?: string,
): Promise<SessionStatsResp> => {
  const { data } = await $api.get("/audit/sessions/stats", {
    params: clean({ from, to }),
  });
  return data;
};

export interface SessionChartPoint {
  day: string;
  sessions: number;
  seconds: number;
  uniqueUsers: number;
}

export const fetchSessionChart = async (
  days = 30,
): Promise<SessionChartPoint[]> => {
  const { data } = await $api.get("/audit/sessions/chart", {
    params: { days },
  });
  return data;
};

/* ===== Admin actions ===== */

export interface ActionsResp {
  items: IAdminAction[];
  pagination: IPagination;
}

export interface ActionsFilter {
  actorId?: number;
  action?: AdminActionType;
  targetType?: AdminTargetType;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const fetchActions = async (
  filters: ActionsFilter,
): Promise<ActionsResp> => {
  const { data } = await $api.get("/audit/actions", {
    params: clean(filters),
  });
  return data;
};

export interface ActionStatsResp {
  from: string;
  to: string;
  total: number;
  byType: { action: AdminActionType; count: number }[];
  topActors: {
    actorId: number;
    full_name: string | null;
    email: string | null;
    count: number;
  }[];
}

export const fetchActionStats = async (
  from?: string,
  to?: string,
): Promise<ActionStatsResp> => {
  const { data } = await $api.get("/audit/actions/stats", {
    params: clean({ from, to }),
  });
  return data;
};

/* ===== Labels (uz) ===== */

export const ACTION_LABEL: Record<AdminActionType, string> = {
  product_created: "Mahsulot yaratildi",
  product_updated: "Mahsulot yangilandi",
  product_deleted: "Mahsulot o'chirildi",
  product_status_changed: "Mahsulot statusi",
  user_created: "Foydalanuvchi yaratildi",
  user_updated: "Foydalanuvchi yangilandi",
  user_deleted: "Foydalanuvchi o'chirildi",
  user_blocked: "Foydalanuvchi bloklandi",
  user_unblocked: "Blokdan chiqarildi",
  category_created: "Kategoriya yaratildi",
  category_updated: "Kategoriya yangilandi",
  category_deleted: "Kategoriya o'chirildi",
  loan_created: "Kitob berildi",
  loan_returned: "Kitob qaytarildi",
  hemis_sync_started: "HEMIS sinxr. boshlandi",
};

export const LOGIN_METHOD_LABEL: Record<LoginEventMethod, string> = {
  admin_password: "Admin (email/parol)",
  hemis: "HEMIS",
  google: "Google",
  refresh: "Refresh",
};

export const LOGIN_REASON_LABEL: Record<string, string> = {
  wrong_password: "Parol noto'g'ri",
  user_not_found: "Topilmadi",
  blocked: "Bloklangan",
  inactive: "Faol emas",
  hemis_error: "HEMIS xato",
  google_error: "Google xato",
  refresh_invalid: "Refresh yaroqsiz",
  unknown: "Noma'lum",
};
