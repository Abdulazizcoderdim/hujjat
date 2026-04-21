import axios from "axios";

const TOKEN_KEY = "ADMIN_ACCESS_TOKEN";

const $api = axios.create({
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

$api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url || "";

    const isAuthEndpoint =
      url.includes("/auth/login") || url.includes("/auth/refresh");

    if (
      status === 401 &&
      !isAuthEndpoint &&
      window.location.pathname !== "/login"
    ) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.replace("/login");
    }

    return Promise.reject(error);
  },
);

export default $api;
