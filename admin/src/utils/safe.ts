export const safeText = (value?: string | number) => {
  if (value === null || value === undefined || value === "") return "--";
  return value;
};

export const safeDate = (value?: string | Date) => {
  if (!value) return "--";
  const date = new Date(value);
  return isNaN(date.getTime()) ? "--" : date.toLocaleDateString("uz-UZ");
};
