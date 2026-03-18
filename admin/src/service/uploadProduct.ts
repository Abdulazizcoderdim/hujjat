import $api from "@/http/axios";

export const createProduct = async (payload: {
  file: File;
  poster: File | null;
  name: string;
  description: string;
  categoryId: string;
  tags: string;
  onProgress: (percent: number) => void;
}) => {
  const formData = new FormData();
  formData.append("file", payload.file);

  if (payload.poster) {
    formData.append("poster", payload.poster);
  }

  formData.append("name", payload.name);
  formData.append("description", payload.description);
  formData.append("categoryId", payload.categoryId);
  formData.append("tags", payload.tags);

  const res = await $api.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },

    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1),
      );
      payload.onProgress(percentCompleted);
    },
  });

  return res.data;
};
