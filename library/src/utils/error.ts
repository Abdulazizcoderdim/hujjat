/** Foydalanuvchiga ko'rsatish uchun xavfsiz, sodda xato xabarini chiqarib oladi.
 *  Backend tomonidan kelgan xom error.response.data ni to'g'ridan-to'g'ri
 *  ko'rsatmaymiz (ichida sensitive ma'lumot bo'lishi mumkin). */
export const getErrorMessage = (err: unknown): string => {
  const e = err as {
    response?: { status?: number; data?: { message?: string | string[] } };
    message?: string;
  };
  const status = e?.response?.status;
  const raw = e?.response?.data?.message;
  const fromBackend = Array.isArray(raw) ? raw.join(", ") : raw;
  if (status === 401 || status === 403) return "Tizimga qayta kiring";
  if (status === 404) return "Topilmadi";
  if (status === 409) return fromBackend || "Bunday yozuv allaqachon mavjud";
  if (status === 422) return fromBackend || "Ma'lumot to'g'ri emas";
  if (status && status >= 500) return "Server xatosi — keyinroq urinib ko'ring";
  if (fromBackend && fromBackend.length < 200) return fromBackend;
  return "Xato yuz berdi";
};
