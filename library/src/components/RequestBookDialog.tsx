import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import $api from "@/http/axios";
import { ICategory, IProduct } from "@/interface";
import useDebounce from "@/hooks/useDebounce";
import {
  createBookRequest,
  CreateBookRequestPayload,
} from "@/service/bookRequests";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, BookOpen, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultTitle?: string;
}

export function RequestBookDialog({ open, onClose, defaultTitle = "" }: Props) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateBookRequestPayload>({
    title: defaultTitle,
    author: "",
    description: "",
    reason: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        title: defaultTitle,
        author: "",
        description: "",
        reason: "",
      });
    }
  }, [open, defaultTitle]);

  const debouncedTitle = useDebounce(form.title, 350);
  const titleQuery = (debouncedTitle ?? "").trim();

  const { data: suggestions = [] } = useQuery<IProduct<ICategory>[]>({
    queryKey: ["product-suggestions", titleQuery],
    queryFn: async () => {
      const { data } = await $api.get("/products/books/search", {
        params: { q: titleQuery },
      });
      return data;
    },
    enabled: open && titleQuery.length >= 2,
  });

  const submitMu = useMutation({
    mutationFn: createBookRequest,
    onSuccess: () => {
      toast.success("So'rovingiz qabul qilindi");
      qc.invalidateQueries({ queryKey: ["my-book-requests"] });
      onClose();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Xato yuz berdi"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    submitMu.mutate({
      title: form.title.trim(),
      author: form.author?.trim() || undefined,
      description: form.description?.trim() || undefined,
      reason: form.reason?.trim() || undefined,
    });
  };

  const matchingSuggestion = suggestions.find(
    (s) => s.name?.toLowerCase().trim() === form.title.toLowerCase().trim(),
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Kitob so'rash
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">
              Kitob nomi <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="masalan: Algoritmlar va ma'lumotlar tuzilmalari"
              required
              maxLength={255}
              autoFocus
            />
          </div>

          {/* Smart suggestion: book already exists */}
          {matchingSuggestion && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">
                  Bu kitob kutubxonada allaqachon mavjud
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  "{matchingSuggestion.name}" — {matchingSuggestion.author || "—"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/book/${matchingSuggestion.id}`);
                  }}
                  className="mt-1 text-xs text-primary hover:underline"
                >
                  Kitobni ochish →
                </button>
              </div>
            </div>
          )}
          {!matchingSuggestion &&
            suggestions.length > 0 &&
            titleQuery.length >= 2 && (
              <div className="rounded-lg border border-border bg-muted/30 p-2.5">
                <p className="text-xs font-medium mb-1">
                  Shu nomga o'xshash kitoblar bor:
                </p>
                <ul className="space-y-1">
                  {suggestions.slice(0, 3).map((s) => (
                    <li
                      key={s.id}
                      className="text-xs text-muted-foreground truncate"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate(`/book/${s.id}`);
                        }}
                        className="hover:text-primary hover:underline text-left"
                      >
                        {s.name} {s.author && `— ${s.author}`}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Muallif (ixtiyoriy)</label>
            <Input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Abdulla Qodiriy"
              maxLength={255}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">
              Qo'shimcha ma'lumot (ixtiyoriy)
            </label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Nashr yili, til, qaysi bobi va h.k."
              rows={2}
              maxLength={2000}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">
              Nima maqsadda kerak? (ixtiyoriy)
            </label>
            <Textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Sillabus uchun, kurs ishi, qiziqish..."
              rows={2}
              maxLength={2000}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitMu.isPending}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={!form.title.trim() || submitMu.isPending}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {submitMu.isPending ? "Yuborilmoqda..." : "Yuborish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
