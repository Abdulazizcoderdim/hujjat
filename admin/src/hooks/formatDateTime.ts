import { format } from "date-fns";

export function formatDateTime(isoString: Date | string): string {
  const date = new Date(isoString);

  return format(date, "yyyy-MM-dd HH:mm");
}
