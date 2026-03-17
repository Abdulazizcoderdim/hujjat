import $api from "@/http/axios";
import { uploadToSignedUrl } from "@/utils/uploadToSignedUrl";

export type UploadProvider = "web_single" | "web";

export async function singleUploadDocument(params: {
  file: File;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  tags?: string[];
  onProgress?: (percent: number) => void;
}) {
  const { file, name, description, categoryId, price, tags, onProgress } =
    params;

  const prepareRes = await $api.post("/products/single/prepare", {
    filename: file.name,
    contentType: file.type || "application/octet-stream",
  });

  const { uploadUrl, fileKey } = prepareRes.data;

  await uploadToSignedUrl(uploadUrl, file, onProgress);

  const completeRes = await $api.post("/products", {
    fileKey,
    price,
    name,
    description,
    categoryId,
    tags: tags || [],
  });

  return completeRes.data;
}
