export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
};
