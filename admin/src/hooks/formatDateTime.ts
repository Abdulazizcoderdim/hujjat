import { format } from "date-fns";

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);

  return format(date, "yyyy-MM-dd HH:mm");
}
