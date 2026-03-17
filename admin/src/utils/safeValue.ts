export const safeValue = (value: any) => {
  if (value === null || value === undefined || value === "") return "--";
  return value;
};
