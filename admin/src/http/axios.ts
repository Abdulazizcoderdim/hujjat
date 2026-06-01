import axios, { AxiosError, AxiosRequestConfig } from "axios";

const TOKEN_KEY = "ADMIN_ACCESS_TOKEN";

const $api = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_API_URL,
});

// Separate instance for refresh — no interceptors, no auth header (avoids loop)
const $refresh = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_API_URL,
});

$api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

const flushQueue = (err: unknown, token?: string) => {
  pendingQueue.forEach((p) => {
    if (err || !token) p.reject(err);
    else p.resolve(token);
  });
  pendingQueue = [];
};

const isAuthPath = (url: string) =>
  url.includes("/auth/login") ||
  url.includes("/auth/refresh") ||
  url.includes("/auth/logout") ||
  url.includes("/auth/hemis/login");

$api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error?.response?.status;
    const original = error?.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const url = original?.url || "";

    // 401 on refresh itself or login → hard logout
    if (status === 401 && original && !isAuthPath(url) && !original._retry) {
      original._retry = true;

      // Coalesce concurrent refresh requests
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token: string) => {
              original.headers = original.headers || {};
              (original.headers as any).Authorization = `Bearer ${token}`;
              resolve($api.request(original));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await $refresh.post("/auth/refresh");
        const newToken = data?.accessToken;
        if (!newToken) throw new Error("Refresh response'da accessToken yo'q");

        localStorage.setItem(TOKEN_KEY, newToken);
        flushQueue(null, newToken);

        original.headers = original.headers || {};
        (original.headers as any).Authorization = `Bearer ${newToken}`;
        return $api.request(original);
      } catch (refreshErr) {
        flushQueue(refreshErr);
        const rStatus = (refreshErr as AxiosError)?.response?.status;
        // Only redirect on confirmed auth failures, not network errors
        if (
          (rStatus === 401 || rStatus === 403) &&
          window.location.pathname !== "/login"
        ) {
          localStorage.removeItem(TOKEN_KEY);
          window.location.replace("/login");
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Hard logout on 401 from auth-endpoints or already-retried requests
    if (
      status === 401 &&
      !isAuthPath(url) &&
      window.location.pathname !== "/login"
    ) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.replace("/login");
    }

    return Promise.reject(error);
  },
);

export default $api;
