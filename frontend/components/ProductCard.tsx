"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/hooks/formatPrice";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { IOrder, IProduct, RefundStatus } from "@/interface";
import { cn } from "@/lib/utils";
import { authStore } from "@/store/auth.store";
import {
  Download,
  Eye,
  FileText,
  HelpCircle,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { PurchaseModal } from "./PurchaseModal";
import { Textarea } from "./ui/textarea";

interface ProductCardProps {
  product: any;
  className?: string;
  isBuy?: boolean;
  order?: IOrder<IProduct<string, string>> | null;
}

const REFUND_LIMIT_HOURS = 24;

const canRefund = (order: IOrder<IProduct<string, string>>) => {
  const baseDate = new Date(order.createdAt);
  const diffMs = Date.now() - baseDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours <= REFUND_LIMIT_HOURS;
};

const extColors: Record<string, string> = {
  pdf: "bg-red-500/10 text-red-600",
  docx: "bg-blue-500/10 text-blue-600",
  pptx: "bg-orange-500/10 text-orange-600",
  xlsx: "bg-green-500/10 text-green-600",
  txt: "bg-gray-500/10 text-gray-600",
};

export const ProductCard = ({
  product,
  className,
  isBuy = false,
  order = null,
}: ProductCardProps) => {
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder<
    IProduct<string, string>
  > | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { isAuth } = authStore();

  const handleRefundClick = (order: IOrder<IProduct<string, string>>) => {
    setSelectedOrder(order);
    setRefundReason("");
    setIsRefundModalOpen(true);
  };

  const handleRefundSubmit = async () => {
    if (!selectedOrder || !refundReason.trim()) return;

    setIsSubmitting(true);

    await $api.post("/refunds", {
      orderId: selectedOrder.id,
      reason: refundReason,
    });

    setIsSubmitting(false);
    setIsRefundModalOpen(false);
    setSelectedOrder(null);
    setRefundReason("");

    toast({
      title: "So'rov yuborildi",
      description:
        "Sizning qaytarish so'rovingiz admin tomonidan ko'rib chiqiladi.",
    });
  };

  const handleClickBuy = () => {
    if (!isAuth) {
      toast({
        title: "Iltimos, ro'yxatdan o'ting",
        description: "Sotib olish uchun ro'yxatdan o'ting",
      });

      router.push(`/auth?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    setIsPurchaseModalOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          "group bg-card rounded-2xl border border-border overflow-hidden card-hover",
          className,
        )}
      >
        {/* Image */}
        <Link
          href={`/product/${product.slug}`}
          className="block relative aspect-[4/3] overflow-hidden"
        >
          <img
            src={
              product.poster ||
              "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg"
            }
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick View Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button variant="secondary" size="sm" className="shadow-lg">
              <Eye className="w-4 h-4 mr-2" />
              Ko'rish
            </Button>
          </div>

          {/* Extension Badge */}
          <Badge
            className={cn(
              "absolute top-3 right-3 uppercase text-xs font-semibold",
              extColors[product.fileExt],
            )}
          >
            {product.fileExt}
          </Badge>
        </Link>

        {/* Content */}
        <div className="p-5">
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {product.pages} sahifa
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              {product.soldCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {product.viewCount}
            </span>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between">
            <div className="font-display font-bold text-lg text-primary">
              {formatPrice(product.price)}
            </div>
            {!isBuy ? (
              <Button
                onClick={handleClickBuy}
                size="sm"
                variant="accent"
                className="group/btn"
              >
                <ShoppingCart className="w-4 h-4 mr-1.5 group-hover/btn:scale-110 transition-transform" />
                Sotib olish
              </Button>
            ) : (
              order &&
              canRefund(order) &&
              order.refundStatus !== RefundStatus.PENDING && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => handleRefundClick(order)}
                >
                  <HelpCircle className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Muammo bormi?</span>
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      <PurchaseModal
        product={product}
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />

      {/* Refund Modal */}
      <Dialog open={isRefundModalOpen} onOpenChange={setIsRefundModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              Mablag'ni qaytarish so'rovi
            </DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <span className="font-medium text-foreground">
                  "{selectedOrder.productId.name}"
                </span>
              )}{" "}
              uchun qaytarish so'rovi
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="refund-reason"
                className="text-sm font-medium text-foreground"
              >
                Sabab <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="refund-reason"
                placeholder="Iltimos, sababni batafsil yozing..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isSubmitting}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                ⚠️ So'rov admin tomonidan tekshiriladi. Asossiz so'rovlar rad
                etilishi mumkin.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsRefundModalOpen(false)}
              disabled={isSubmitting}
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefundSubmit}
              disabled={!refundReason.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Yuborilmoqda...
                </>
              ) : (
                "Yuborish"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
