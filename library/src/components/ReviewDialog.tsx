import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquare, Star as StarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { submitReview } from "@/service/bookReviews";
import { getErrorMessage } from "@/utils/error";
import { StarRating } from "./StarRating";

interface Props {
  open: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  /** Talabaning mavjud sharhi (tahrirlash uchun) */
  initial?: { rating: number; comment: string } | null;
}

const MIN_LEN = 10;
const MAX_LEN = 1000;

export function ReviewDialog({
  open,
  onClose,
  productId,
  productName,
  initial,
}: Props) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [comment, setComment] = useState(initial?.comment ?? "");

  useEffect(() => {
    if (open) {
      setRating(initial?.rating ?? 0);
      setComment(initial?.comment ?? "");
    }
  }, [open, initial?.rating, initial?.comment]);

  const submitMu = useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      toast.success(
        initial
          ? "Sharhingiz yangilandi — moderatsiyadan o'tishi kerak"
          : "Sharhingiz qabul qilindi — moderatsiyadan o'tishi kerak",
      );
      qc.invalidateQueries({ queryKey: ["product-reviews", productId] });
      qc.invalidateQueries({ queryKey: ["my-reviews"] });
      qc.invalidateQueries({ queryKey: ["book", productId] });
      onClose();
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
  });

  const trimmed = comment.trim();
  const valid =
    rating >= 1 &&
    rating <= 5 &&
    trimmed.length >= MIN_LEN &&
    trimmed.length <= MAX_LEN;
  const tooShort = trimmed.length > 0 && trimmed.length < MIN_LEN;
  const tooLong = trimmed.length > MAX_LEN;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || submitMu.isPending) return;
    submitMu.mutate({ productId, rating, comment: trimmed });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !submitMu.isPending && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            {initial ? "Sharhni yangilash" : "Sharh yozish"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1 line-clamp-1">
              {productName}
            </p>
          </div>

          {/* Yulduzcha */}
          <div className="flex flex-col items-center gap-1 py-2">
            <StarRating
              value={rating}
              size="lg"
              interactive
              onChange={setRating}
            />
            <div className="text-xs text-muted-foreground">
              {rating === 0
                ? "Yulduzchani tanlang"
                : rating === 5
                  ? "A'lo"
                  : rating === 4
                    ? "Yaxshi"
                    : rating === 3
                      ? "O'rtacha"
                      : rating === 2
                        ? "Yomon"
                        : "Juda yomon"}
            </div>
          </div>

          {/* Matn */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="review-text">
              Sharhingiz
            </label>
            <Textarea
              id="review-text"
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={MAX_LEN}
              placeholder="Kitob haqida fikringizni yozing — nimasi yoqdi, nimasi yoqmadi, kimga tavsiya qilasiz..."
              disabled={submitMu.isPending}
              aria-invalid={tooShort || tooLong}
            />
            <div className="flex items-center justify-between text-[11px]">
              {tooShort ? (
                <span className="text-destructive">
                  Kamida {MIN_LEN} ta belgi
                </span>
              ) : tooLong ? (
                <span className="text-destructive">Juda uzun</span>
              ) : (
                <span className="text-muted-foreground">
                  {MIN_LEN}–{MAX_LEN} ta belgi
                </span>
              )}
              <span
                className={
                  trimmed.length > MAX_LEN - 50
                    ? "text-destructive"
                    : "text-muted-foreground"
                }
              >
                {trimmed.length} / {MAX_LEN}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitMu.isPending}
            >
              Bekor qilish
            </Button>
            <Button type="submit" disabled={!valid || submitMu.isPending}>
              {submitMu.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <StarIcon className="w-4 h-4" />
              )}
              {initial ? "Yangilash" : "Yuborish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ReviewDialog;
