import { SearchableSelect } from "@/components/SearchableSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isEduConfigured } from "@/http/edusystem";
import {
  fetchCurriculums,
  fetchSemesters,
  fetchSubjects,
} from "@/service/edusystem";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  GraduationCap,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

export interface CurriculumLinkValue {
  curriculumId: number | "";
  semester: number | "";
  subjectId: number | "";
  isMain: boolean;
}

interface Props {
  value: CurriculumLinkValue[];
  onChange: (links: CurriculumLinkValue[]) => void;
  disabled?: boolean;
}

const blank = (): CurriculumLinkValue => ({
  curriculumId: "",
  semester: "",
  subjectId: "",
  isMain: false,
});

export function CurriculumLinksFieldset({ value, onChange, disabled }: Props) {
  const curriculumsQ = useQuery({
    queryKey: ["edu", "curriculums"],
    queryFn: fetchCurriculums,
    enabled: isEduConfigured,
    staleTime: 5 * 60 * 1000,
  });

  const subjectsQ = useQuery({
    queryKey: ["edu", "subjects", "curriculum-only"],
    queryFn: () => fetchSubjects(true),
    enabled: isEduConfigured,
    staleTime: 5 * 60 * 1000,
  });

  const semestersQ = useQuery({
    queryKey: ["edu", "semesters"],
    queryFn: fetchSemesters,
    enabled: isEduConfigured,
    staleTime: 5 * 60 * 1000,
  });

  const curriculums = curriculumsQ.data ?? [];
  const subjects = subjectsQ.data ?? [];
  const semesters = semestersQ.data ?? [];

  const isLoading =
    curriculumsQ.isLoading || subjectsQ.isLoading || semestersQ.isLoading;
  const hasError =
    !!curriculumsQ.error || !!subjectsQ.error || !!semestersQ.error;

  const updateRow = (idx: number, patch: Partial<CurriculumLinkValue>) => {
    onChange(value.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  };

  const removeRow = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const addRow = () => {
    onChange([...value, blank()]);
  };

  if (!isEduConfigured) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <code className="rounded bg-destructive/10 px-1">
            VITE_EDUSYSTEM_CORE_URL
          </code>{" "}
          sozlanmagan — biriktirish uchun .env'da uni o'rnating.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span className="font-medium">O'quv reja biriktirishlari</span>
          {value.length > 0 && (
            <Badge variant="secondary" className="font-normal">
              {value.length}
            </Badge>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          disabled={disabled || isLoading}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Biriktirish qo'shish
        </Button>
      </div>

      {hasError && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/5 p-3 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>edusystem-core'dan ma'lumot olishda xato. Qaytadan urinib ko'ring.</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 rounded-md border border-dashed p-4 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          O'quv rejalar yuklanmoqda...
        </div>
      )}

      {!isLoading && value.length === 0 && (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          Hali biriktirish yo'q. Yuqoridagi tugma orqali qo'shing.
        </div>
      )}

      <div className="space-y-3">
        {value.map((row, idx) => (
          <div
            key={idx}
            className="rounded-lg border bg-muted/20 p-3 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Biriktirish #{idx + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Biriktirishni o'chirish"
                disabled={disabled}
                onClick={() => removeRow(idx)}
                className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs">O'quv reja</Label>
                <SearchableSelect
                  value={row.curriculumId ? String(row.curriculumId) : ""}
                  onChange={(v) =>
                    updateRow(idx, { curriculumId: v ? Number(v) : "" })
                  }
                  disabled={disabled || isLoading || hasError}
                  options={curriculums.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                  }))}
                  placeholder="O'quv rejani tanlang"
                  searchPlaceholder="O'quv reja nomidan qidirish..."
                  emptyText="O'quv reja topilmadi"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Semestr</Label>
                <Select
                  value={row.semester ? String(row.semester) : ""}
                  onValueChange={(v) => updateRow(idx, { semester: Number(v) })}
                  disabled={disabled || isLoading || hasError}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((s) => (
                      <SelectItem
                        key={s.id}
                        value={String(s.value ?? s.id)}
                      >
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Fan</Label>
                <SearchableSelect
                  value={row.subjectId ? String(row.subjectId) : ""}
                  onChange={(v) =>
                    updateRow(idx, { subjectId: v ? Number(v) : "" })
                  }
                  disabled={disabled || isLoading || hasError}
                  options={subjects.map((s) => ({
                    value: String(s.id),
                    label: s.name,
                  }))}
                  placeholder="Fanni tanlang"
                  searchPlaceholder="Fan nomidan qidirish..."
                  emptyText="Fan topilmadi"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id={`isMain-${idx}`}
                checked={row.isMain}
                onCheckedChange={(checked) =>
                  updateRow(idx, { isMain: !!checked })
                }
                disabled={disabled}
              />
              <Label
                htmlFor={`isMain-${idx}`}
                className="cursor-pointer text-sm font-normal"
              >
                Asosiy darslik
              </Label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
