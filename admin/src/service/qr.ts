import $api from "@/http/axios";

/** Endpointlar JWT talab qiladi — shuning uchun oddiy <a href> emas,
 *  axios blob orqali yuklab, vaqtinchalik object URL yasaymiz. */

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Brauzer yuklashni boshlashi uchun ozgina kutib, keyin bo'shatamiz
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

/** QR rasmini oldindan ko'rish uchun object URL (chaqiruvchi revoke qiladi). */
export const fetchQrPngUrl = async (
  productId: number,
  size = 320,
): Promise<string> => {
  const { data } = await $api.get(`/products/qr/${productId}.png`, {
    params: { size },
    responseType: "blob",
  });
  return URL.createObjectURL(data as Blob);
};

export const downloadQrPng = async (productId: number, name: string) => {
  const { data } = await $api.get(`/products/qr/${productId}.png`, {
    params: { size: 600 },
    responseType: "blob",
  });
  downloadBlob(data as Blob, `qr-${productId}-${safeName(name)}.png`);
};

export const downloadLabelPdf = async (productId: number, name: string) => {
  const { data } = await $api.get(`/products/qr/${productId}/label.pdf`, {
    responseType: "blob",
  });
  downloadBlob(data as Blob, `qr-label-${productId}-${safeName(name)}.pdf`);
};

export interface LabelsPdfParams {
  ids?: number[];
  all?: boolean;
  category?: number;
  search?: string;
  cutLines?: boolean;
}

export const downloadLabelsPdf = async (params: LabelsPdfParams) => {
  const query: Record<string, string | number> = {};
  if (params.ids?.length) query.ids = params.ids.join(",");
  else query.all = 1;
  if (params.category) query.category = params.category;
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.cutLines === false) query.cutLines = 0;

  const { data } = await $api.get("/products/qr-labels.pdf", {
    params: query,
    responseType: "blob",
  });
  const count = params.ids?.length ? params.ids.length : "all";
  downloadBlob(data as Blob, `qr-labels-${count}.pdf`);
};

/** QR ichidagi manzil — faqat ko'rsatish uchun (backend bilan bir xil qoida). */
export const qrTargetUrl = (productId: number) => {
  const base = (import.meta.env.VITE_LIBRARY_PUBLIC_URL as string | undefined)
    ?.replace(/\/+$/, "");
  return base ? `${base}/qr/${productId}` : `/qr/${productId}`;
};

const safeName = (s: string) =>
  (s || "book")
    .toLowerCase()
    .replace(/[^a-z0-9а-яёўғҳқ]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "book";
