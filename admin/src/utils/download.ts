/** Blob'ni fayl sifatida yuklab olish. Endpointlar JWT talab qilgani uchun
 *  oddiy <a href> ishlamaydi — axios bilan olib, vaqtinchalik URL yasaymiz. */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

/** Fayl nomi uchun xavfsiz matn — taqiqlangan belgilar olib tashlanadi,
 *  o'qilishi uchun bo'shliq va harflar saqlanadi. */
export const safeFileName = (s: string, max = 120): string =>
  (s || "")
    .replace(/[\\/:*?"<>|\r\n]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max) || "fayl";
