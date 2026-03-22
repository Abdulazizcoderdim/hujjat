import axios from "axios";

const $api = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_API_URL,
});

$api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${localStorage.getItem(
    "ADMIN_ACCESS_TOKEN",
  )}`;
  return config;
});

// $api.interceptors.response.use(
//   (config) => {
//     return config;
//   },
//   async (error) => {
//     const originalRequest = error.config;

//     if (
//       error.response?.status === 401 &&
//       originalRequest &&
//       !originalRequest._isRetry
//     ) {
//       originalRequest._isRetry = true;

//       if (isRefreshing) {
//         return new Promise((resolve) => {
//           addRefreshSubscriber((token: string) => {
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             resolve($api.request(originalRequest));
//           });
//         });
//       }

//       isRefreshing = true;

//       try {
//         const { data } = await $axios.post("/auth/refresh");
//         localStorage.setItem("ADMIN_ACCESS_TOKEN", data.accessToken);
//         isRefreshing = false;
//         onRefreshed(data.accessToken);
//         return $api.request(originalRequest);
//       } catch (refreshError: any) {
//         isRefreshing = false;
//         refreshSubscribers = [];

//         // Faqat 401/403 da login sahifasiga yo'naltirish
//         // Network xato bo'lsa (server o'chgan, internet yo'q) — otib yubormaslik
//         const status = refreshError?.response?.status;
//         if (status === 401 || status === 403) {
//           localStorage.removeItem("ADMIN_ACCESS_TOKEN");
//           window.location.href = "/login";
//         }

//         return Promise.reject(refreshError);
//       }
//     }

//     throw error;
//   },
// );

export default $api;
