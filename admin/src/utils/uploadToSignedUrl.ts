import axios from "axios";

export async function uploadToSignedUrl(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
) {
  await axios.put(uploadUrl, file, {
    onUploadProgress: (evt) => {
      if (!evt.total) return;
      const percent = Math.round((evt.loaded * 100) / evt.total);
      onProgress?.(percent);
    },
  });
}
