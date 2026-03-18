export const formatUzDate = (value?: Date) => {
  if (!value) {
    return "Noma'lum";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Noma'lum";
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};
