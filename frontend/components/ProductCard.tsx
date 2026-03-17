"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/hooks/formatPrice";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { authStore } from "@/store/auth.store";
import { Download, Eye, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { PurchaseModal } from "./PurchaseModal";

interface ProductCardProps {
  product: any;
  className?: string;
  isBuy?: boolean;
}

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
}: ProductCardProps) => {
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const [refundReason, setRefundReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { isAuth } = authStore();

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
            {/* <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {product.pages} sahifa
            </span> */}
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
            {!isBuy && (
              <Button
                onClick={handleClickBuy}
                size="sm"
                variant="accent"
                className="group/btn"
              >
                <ShoppingCart className="w-4 h-4 mr-1.5 group-hover/btn:scale-110 transition-transform" />
                Sotib olish
              </Button>
            )}
          </div>
        </div>
      </div>

      <PurchaseModal
        product={product}
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />
    </>
  );
};
