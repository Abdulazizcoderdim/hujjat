import $api from "@/http/axios";

export const createProduct = async (payload: {
  file: File;
  poster: File | null;
  name: string;
  description: string;
  categoryId: string;
  tags: string;
  pages: string;
  author: string;
  year: string;
  language: string;
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

  if (payload.pages) {
    formData.append("pages", payload.pages);
  }
  if (payload.author) {
    formData.append("author", payload.author);
  }
  if (payload.year) {
    formData.append("year", payload.year);
  }
  if (payload.language) {
    formData.append("language", payload.language);
  }

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
