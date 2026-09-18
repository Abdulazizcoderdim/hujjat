import Header from "@/components/Header";
import SidebarNav from "@/components/SidebarNav";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { IMyReview, ReviewStatus } from "@/interface";
import { deleteMyReview, fetchMyReviews } from "@/service/bookReviews";
import { getErrorMessage } from "@/utils/error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Trash2,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusInfo = (s: ReviewStatus) => {
  switch (s) {
    case ReviewStatus.PENDING:
      return {
        label: "Moderatsiyada",
        icon: Clock,
        bg: "bg-amber-100",
        text: "text-amber-700",
      };
    case ReviewStatus.APPROVED:
      return {
        label: "Tasdiqlangan",
        icon: CheckCircle2,
        bg: "bg-emerald-100",
        text: "text-emerald-700",
      };
    case ReviewStatus.REJECTED:
      return {
        label: "Rad etilgan",
        icon: XCircle,
        bg: "bg-rose-100",
        text: "text-rose-700",
      };
  }
};

const MyReviewsPage = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-reviews", "page"],
    queryFn: () => fetchMyReviews({ page: 1, limit: 50 }),
  });

  const deleteMu = useMutation({
    mutationFn: deleteMyReview,
    onSuccess: () => {
      toast.success("Sharh o'chirildi");
      qc.invalidateQueries({ queryKey: ["my-reviews"] });
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
  });

  const items: IMyReview[] = data?.items ?? [];

  return (
    <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
      <SidebarNav />
      <main className="flex-1 flex flex-col min-w-0">
        <Header title="Mening sharhlarim" />

        <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Hali sharh yozmadingiz</p>
              <p className="text-xs mt-1">
                Kitoblar sahifasida o'qigan kitoblaringizga sharh yozing
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((r, idx) => {
                const info = statusInfo(r.status);
                const Icon = info.icon;
                return (
                  <motion.li
                    key={r.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-4 border border-border rounded-xl bg-card"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {r.product?.poster && (
                          <img
                            src={r.product.poster}
                            alt=""
                            className="w-12 h-16 rounded object-cover border flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          {r.product?.id ? (
                            <Link
                              to={`/book/${r.product.id}`}
                              className="text-sm font-semibold truncate hover:text-primary block"
                            >
                              {r.product.name}
                            </Link>
                          ) : (
                            <p className="text-sm font-semibold text-muted-foreground">
                              [Kitob o'chirilgan]
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating value={r.rating} size="sm" />
                            <span className="text-[11px] text-muted-foreground">
                              {fmtDate(r.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${info.bg} ${info.text}`}
                      >
                        <Icon className="w-3 h-3" /> {info.label}
                      </span>
                    </div>

                    <p className="text-sm text-foreground/85 whitespace-pre-line">
                      {r.comment}
                    </p>

                    {r.status === ReviewStatus.REJECTED && r.modNote && (
                      <div className="mt-2 p-2 border border-rose-200 bg-rose-50 rounded text-xs text-rose-700 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Admin sababi:</strong> {r.modNote}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("Sharhni o'chirishni xohlaysizmi?"))
                            deleteMu.mutate(r.id);
                        }}
                        disabled={deleteMu.isPending}
                        className="h-7 text-rose-600 hover:text-rose-700 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        O'chirish
                      </Button>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
        </div>
      </main>
    </div>
  );
};

export default MyReviewsPage;
