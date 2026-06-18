import Header from "@/components/Header";
import { RequestBookDialog } from "@/components/RequestBookDialog";
import SidebarNav from "@/components/SidebarNav";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BookRequestStatus, IBookRequest } from "@/interface";
import { cancelRequest, fetchMyRequests } from "@/service/bookRequests";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquarePlus,
  PackageCheck,
  Plus,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const fmtDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusMeta = (s: BookRequestStatus) => {
  switch (s) {
    case "pending":
      return {
        label: "Kutilmoqda",
        icon: Clock,
        cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      };
    case "approved":
      return {
        label: "Tasdiqlangan",
        icon: CheckCircle2,
        cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
      };
    case "rejected":
      return {
        label: "Rad etilgan",
        icon: XCircle,
        cls: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
      };
    case "fulfilled":
      return {
        label: "Bajarilgan",
        icon: PackageCheck,
        cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      };
  }
};

const MyRequests = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelRequestId, setCancelRequestId] = useState<number | null>(null);

  const { data: items = [], isLoading } = useQuery<IBookRequest[]>({
    queryKey: ["my-book-requests"],
    queryFn: fetchMyRequests,
  });

  const cancelMu = useMutation({
    mutationFn: cancelRequest,
    onSuccess: () => {
      toast.success("So'rov bekor qilindi");
      qc.invalidateQueries({ queryKey: ["my-book-requests"] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Xato yuz berdi"),
  });

  return (
    <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
      <SidebarNav activePage="my-requests" />

      <main className="flex-1 flex flex-col min-w-0">
        <Header title="Kitob so'rovlarim" />

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Kerakli kitobni topa olmasangiz, biz uchun so'rab qoldiring.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Yangi so'rov
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-card/50 animate-pulse"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-4">
                <MessageSquarePlus className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-medium mb-1.5">
                Hozircha so'rovlaringiz yo'q
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Kutubxonada bo'lmagan kitob kerak bo'lsa, "Yangi so'rov"ni bosing.
              </p>
              <button
                onClick={() => setOpen(true)}
                className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Yangi so'rov yuborish
              </button>
            </motion.div>
          ) : (
            <div className="grid gap-3">
              {items.map((r, i) => {
                const meta = statusMeta(r.status);
                const Icon = meta.icon;
                const isPending = r.status === "pending";
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <h4 className="text-base font-semibold">{r.title}</h4>
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium ${meta.cls}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {meta.label}
                          </span>
                        </div>
                        {r.author && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Muallif: {r.author}
                          </p>
                        )}
                        {r.description && (
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {r.description}
                          </p>
                        )}
                        {r.reason && (
                          <p className="text-xs text-muted-foreground/80 mt-1.5 italic">
                            Maqsad: {r.reason}
                          </p>
                        )}

                        {r.adminNote && (
                          <div
                            className={`mt-3 flex gap-2 rounded-lg border p-2.5 text-xs ${
                              r.status === "rejected"
                                ? "border-red-500/30 bg-red-500/5"
                                : "border-blue-500/30 bg-blue-500/5"
                            }`}
                          >
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium mb-0.5">
                                Admin sharhi:
                              </div>
                              <div className="text-muted-foreground whitespace-pre-wrap">
                                {r.adminNote}
                              </div>
                            </div>
                          </div>
                        )}

                        {r.status === "fulfilled" && r.fulfilledProduct && (
                          <button
                            onClick={() =>
                              navigate(`/book/${r.fulfilledProduct!.id}`)
                            }
                            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            Kitob qo'shildi → "{r.fulfilledProduct.name}"
                          </button>
                        )}

                        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>So'ralgan: {fmtDateTime(r.createdAt)}</span>
                          {r.reviewedAt && (
                            <span>
                              Ko'rib chiqilgan: {fmtDateTime(r.reviewedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isPending && (
                      <div className="mt-3 pt-3 border-t border-border/60 flex justify-end">
                        <button
                          disabled={cancelMu.isPending}
                          onClick={() => {
                            setCancelRequestId(r.id);
                            setShowCancelDialog(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        >
                          {cancelMu.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          So'rovni bekor qilish
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <RequestBookDialog open={open} onClose={() => setOpen(false)} />

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>So'rovni bekor qilish</AlertDialogTitle>
            <AlertDialogDescription>
              Haqiqatan ham bu so'rovni bekor qilmoqchisiz? Bu amalni qaytarish mumkin emas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (cancelRequestId) {
                  cancelMu.mutate(cancelRequestId);
                  setShowCancelDialog(false);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              So'rovni bekor qilish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyRequests;
