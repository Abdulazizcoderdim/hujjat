import { Button } from "@/components/ui/button";
import { IMyReview, IPublicReview, ReviewStatus } from "@/interface";
import { authStore } from "@/store/auth.store";
import {
  fetchMyReviews,
  fetchProductReviews,
  toggleHelpful,
} from "@/service/bookReviews";
import { getErrorMessage } from "@/utils/error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Clock,
  Loader2,
  MessageSquare,
  PencilLine,
  ThumbsUp,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ReviewDialog } from "./ReviewDialog";
import { StarRating } from "./StarRating";
import { deleteMyReview } from "@/service/bookReviews";

interface Props {
  productId: number;
  productName: string;
  averageRating?: number | null;
  reviewsCount?: number;
}

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const statusBadge = (s: ReviewStatus) => {
  switch (s) {
    case ReviewStatus.PENDING:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
          <Clock className="w-3 h-3" /> Moderatsiyada
        </span>
      );
    case ReviewStatus.REJECTED:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-medium">
          <XCircle className="w-3 h-3" /> Rad etilgan
        </span>
      );
    default:
      return null;
  }
};

export function BookReviewsSection({
  productId,
  productName,
  averageRating,
  reviewsCount,
}: Props) {
  const qc = useQueryClient();
  const { isAuth, user } = authStore();
  const isStudent = isAuth && (user as any)?.role === "student";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [sort, setSort] = useState<"newest" | "helpful">("newest");
  const [page, setPage] = useState(1);

  const reviewsQ = useQuery({
    queryKey: ["product-reviews", productId, sort, page],
    queryFn: () =>
      fetchProductReviews(productId, { page, limit: 10, sort }),
  });

  // Talaba uchun: o'z sharhini topish (mavjud yoki yo'q)
  const myQ = useQuery({
    queryKey: ["my-reviews"],
    queryFn: () => fetchMyReviews({ page: 1, limit: 100 }),
    enabled: isStudent,
  });

  const myReview: IMyReview | undefined = useMemo(() => {
    if (!myQ.data) return undefined;
    return myQ.data.items.find((r) => r.product?.id === productId);
  }, [myQ.data, productId]);

  const helpfulMu = useMutation({
    mutationFn: toggleHelpful,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-reviews", productId] });
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
  });

  const deleteMu = useMutation({
    mutationFn: deleteMyReview,
    onSuccess: () => {
      toast.success("Sharhingiz o'chirildi");
      qc.invalidateQueries({ queryKey: ["product-reviews", productId] });
      qc.invalidateQueries({ queryKey: ["my-reviews"] });
      qc.invalidateQueries({ queryKey: ["book", String(productId)] });
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
  });

  const items: IPublicReview[] = reviewsQ.data?.items ?? [];
  const totalPages = reviewsQ.data?.pagination?.totalPages ?? 1;
  const avg = averageRating != null ? Number(averageRating) : 0;

  return (
    <section className="mt-10">
      {/* Sarlavha + agregatsiya */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
        <div>
          <h3 className="font-display font-semibold text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Sharhlar
            {reviewsCount ? (
              <span className="text-muted-foreground font-normal text-sm">
                ({reviewsCount})
              </span>
            ) : null}
          </h3>
          {avg > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <StarRating value={avg} size="md" showValue />
              <span className="text-xs text-muted-foreground">
                {reviewsCount} ta talaba bahosi asosida
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isStudent && (
            <Button
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="gap-1.5"
            >
              <PencilLine className="w-3.5 h-3.5" />
              {myReview ? "Sharhni yangilash" : "Sharh yozish"}
            </Button>
          )}
        </div>
      </div>

      {/* Talabaning o'z sharhi (banner) */}
      {isStudent && myReview && myReview.status !== ReviewStatus.APPROVED && (
        <div
          className={`mb-5 p-4 border rounded-xl ${
            myReview.status === ReviewStatus.REJECTED
              ? "border-rose-200 bg-rose-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {statusBadge(myReview.status)}
                <StarRating value={myReview.rating} size="sm" />
              </div>
              <p className="text-sm text-foreground/90 break-words">
                {myReview.comment}
              </p>
              {myReview.status === ReviewStatus.REJECTED && myReview.modNote && (
                <p className="text-xs text-rose-700 mt-2 flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  Admin sababi: {myReview.modNote}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDialogOpen(true)}
                className="h-8"
              >
                <PencilLine className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteMu.mutate(myReview.id)}
                disabled={deleteMu.isPending}
                className="h-8 text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Anonim user uchun ogohlantirish */}
      {!isAuth && (
        <div className="mb-5 p-3 border border-border rounded-xl text-sm text-muted-foreground bg-secondary/50">
          Sharh yozish uchun{" "}
          <Link to="/login" className="text-primary font-medium underline">
            tizimga kiring
          </Link>
        </div>
      )}

      {/* Tartiblash */}
      {items.length > 0 && (
        <div className="flex gap-2 mb-4 text-xs">
          <button
            type="button"
            onClick={() => {
              setSort("newest");
              setPage(1);
            }}
            className={`px-2.5 py-1 rounded-full transition ${
              sort === "newest"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/70"
            }`}
          >
            Yangilar
          </button>
          <button
            type="button"
            onClick={() => {
              setSort("helpful");
              setPage(1);
            }}
            className={`px-2.5 py-1 rounded-full transition ${
              sort === "helpful"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/70"
            }`}
          >
            Foydaliroqlar
          </button>
        </div>
      )}

      {/* Ro'yxat */}
      {reviewsQ.isLoading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
          Hali sharh yo'q. Birinchi bo'lib o'z fikringizni bildiring!
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((r, idx) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="p-4 border border-border rounded-xl bg-card"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {r.reviewer?.image ? (
                      <img
                        src={r.reviewer.image}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      (r.reviewer?.full_name?.[0] ?? "?").toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {r.reviewer?.full_name ?? "Talaba"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {fmtDate(r.createdAt)}
                    </p>
                  </div>
                </div>
                <StarRating value={r.rating} size="sm" />
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                {r.comment}
              </p>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!isStudent) {
                      toast.error("Belgilash uchun tizimga kiring");
                      return;
                    }
                    helpfulMu.mutate(r.id);
                  }}
                  disabled={helpfulMu.isPending}
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition ${
                    r.viewerMarkedHelpful
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                  aria-label="Foydali"
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> {r.helpfulCount}
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-md text-xs font-medium transition ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/70"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <ReviewDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        productId={productId}
        productName={productName}
        initial={
          myReview
            ? { rating: myReview.rating, comment: myReview.comment }
            : null
        }
      />
    </section>
  );
}

export default BookReviewsSection;
