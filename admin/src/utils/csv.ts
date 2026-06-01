export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

const escapeCell = (v: string | number | null | undefined) => {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export function exportToCsv<T>(
  rows: T[],
  columns: CsvColumn<T>[],
  filename: string,
) {
  const header = columns.map((c) => escapeCell(c.header)).join(",");
  const body = rows
    .map((r) => columns.map((c) => escapeCell(c.value(r))).join(","))
    .join("\n");
  // BOM for Excel UTF-8
  const csv = "﻿" + header + "\n" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
