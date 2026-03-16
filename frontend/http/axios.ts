import axios from "axios";
import $axios from ".";

const $api = axios.create({
  withCredentials: true,
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

$api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${localStorage.getItem(
    "USER_ACCESS_TOKEN",
  )}`;
  return config;
});

$api.interceptors.response.use(
  (config) => {
    return config;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._isRetry
    ) {
      originalRequest._isRetry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve($api.request(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await $axios.post("/auth/refresh");
        localStorage.setItem("USER_ACCESS_TOKEN", data.accessToken);
        isRefreshing = false;
        onRefreshed(data.accessToken);
        return $api.request(originalRequest);
      } catch (refreshError: any) {
        isRefreshing = false;
        refreshSubscribers = [];

        // Faqat 401/403 da token o'chirish
        // Network xato bo'lsa — foydalanuvchini otib yubormaslik
        const status = refreshError?.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem("USER_ACCESS_TOKEN");
        }

        return Promise.reject(refreshError);
      }
    }

    throw error;
  },
);

export default $api;
