"use client";

import { ProductCard } from "@/components/ProductCard";
import { PurchaseModal } from "@/components/PurchaseModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { formatPrice } from "@/hooks/formatPrice";
import { useToast } from "@/hooks/use-toast";
import { ICategory, IProduct, IUser } from "@/interface";
import { bytesToMB } from "@/lib/utils";
import { authStore } from "@/store/auth.store";
import {
  ChevronRight,
  Clock,
  Dock,
  Download,
  Eye,
  FileText,
  Share2,
  ShoppingCart,
  Tag,
  User,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const SimplePdfViewer = dynamic(() => import("@/components/BasicPDFViewer"), {
  ssr: false,
});

const ImagePreviewViewer = dynamic(() => import("./ImagePreviewViewer"), {
  ssr: false,
});

interface ProductClientProps {
  product: IProduct<ICategory, IUser>;
  relatedProducts: IProduct<string, string>[];
}

async function handleShare(options: {
  title?: string;
  text?: string;
  url?: string;
}) {
  const shareData = {
    title: options.title ?? "Ulashish",
    text: options.text ?? "",
    url:
      options.url ??
      (typeof window !== "undefined" ? window.location.href : ""),
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareData.url);
      toast?.success?.("Link nusxa olindi ✅");
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = shareData.url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();

    toast?.success?.("Link nusxa olindi ✅");
  } catch (err) {
    toast?.error?.("Ulashib bo‘lmadi ❌");
  }
}

export default function ProductClientPage({
  product: data,
  relatedProducts,
}: ProductClientProps) {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const { isAuth } = authStore();
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

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

  const hasImages = data?.images && data.images.length > 0;
  const hasPreviewPdf = data?.previewPdf;

  return (
    <>
      <div className="container-main">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 sm:text-sm text-[10px] text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Bosh sahifa
          </Link>
          <span>/</span>
          <Link
            href="/categories"
            className="hover:text-primary transition-colors"
          >
            Kategoriyalar
          </Link>
          <span>/</span>
          <span className="text-foreground">{data?.name || "-"}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Image / PDF Viewer */}
          <div className="relative space-y-4">
            <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <FileText className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <p className="sm:text-sm text-xs text-muted-foreground">
                Sotuvda hujjat qisman va "DOCLAB.UZ" suv belgisi bilan
                ko'rinadi. Xariddan so'ng hujjat to'liq, suv belgisiz taqdim
                etiladi.
              </p>
            </div>
            <div className="sm:aspect-[4/3] aspect-[3/3] overflow-y-auto rounded-2xl overflow-hidden bg-secondary">
              <div className="p-4 w-full min-h-full">
                {/* PDF Viewer Client component bo'lishi shart */}
                {hasImages ? (
                  <ImagePreviewViewer images={data.images!} />
                ) : hasPreviewPdf ? (
                  <SimplePdfViewer
                    pdfUrl={`/api/preview?url=${encodeURIComponent(data?.previewPdf ?? "")}`}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Preview mavjud emas
                  </div>
                )}{" "}
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <Tag className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="sm:text-sm text-xs text-muted-foreground">
                Mualliflik huquqi buzilgan holatda{" "}
                <a
                  href="https://t.me/Doclab_Support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  shikoyat qiling!
                </a>
              </p>
            </div>
          </div>

          {/* Details */}
          <div>
            {/* Author Info */}
            {data?.authorId && (
              <Link
                href={`/author/${data?.authorId?.id}`}
                className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-secondary/70 transition-all group mb-6"
              >
                <Avatar className="w-12 h-12 border-2 border-primary/20">
                  <AvatarImage
                    src={
                      data.authorId.avatar ||
                      "https://www.svgrepo.com/show/452030/avatar-default.svg"
                    }
                    alt={data?.authorId.full_name ?? "Nomaʼlum muallif"}
                  />
                  <AvatarFallback>
                    {(data.authorId?.full_name ?? "?")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Muallif
                    </span>
                  </div>
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {data?.authorId.full_name}
                  </h4>
                </div>
                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                  <ChevronRight />
                </div>
              </Link>
            )}

            <div className="flex items-center gap-3 mb-4">
              {data?.categoryId && (
                <Link href={`/category/${data?.categoryId.slug}`}>
                  <Badge variant="secondary" className="hover:bg-secondary/80">
                    {data?.categoryId.name}
                  </Badge>
                </Link>
              )}
            </div>

            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {data?.name}
            </h1>

            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              {data?.description}
            </p>

            {data?.tags && data?.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <Tag className="w-4 h-4 text-muted-foreground" />
                {data?.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Meta Info */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 bg-secondary/50 rounded-xl mb-6">
              <div className="text-center">
                <FileText className="w-5 h-5 mx-auto text-primary mb-1" />
                <div className="font-semibold">{data?.pages}</div>
                <div className="text-xs text-muted-foreground">Sahifalar</div>
              </div>
              <div className="text-center">
                <Dock className="w-5 h-5 mx-auto text-primary mb-1" />
                <div className="font-semibold">{data?.fileExt}</div>
                <div className="text-xs text-muted-foreground">Format</div>
              </div>
              <div className="text-center">
                <Download className="w-5 h-5 mx-auto text-primary mb-1" />
                <div className="font-semibold">
                  {bytesToMB(data?.fileSize ?? 0)}
                </div>
                <div className="text-xs text-muted-foreground">Hajmi</div>
              </div>
              <div className="text-center">
                <Eye className="w-5 h-5 mx-auto text-primary mb-1" />
                <div className="font-semibold">{data?.viewCount}</div>
                <div className="text-xs text-muted-foreground">
                  Ko&apos;rishlar
                </div>
              </div>
              <div className="text-center">
                <Clock className="w-5 h-5 mx-auto text-primary mb-1" />
                <div className="font-semibold">{data?.soldCount}</div>
                <div className="text-xs text-muted-foreground">Sotilgan</div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20 mb-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Narxi</div>
                <div className="font-display text-3xl font-bold text-primary">
                  {formatPrice(data?.price)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleShare({
                      title: "Doclab",
                      text: "Mana shu sahifani ko'ring",
                      url: window.location.href,
                    })
                  }
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                variant="default"
                className="flex-1 sm:py-6 py-4"
                onClick={handleClickBuy}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Sotib olish
              </Button>
            </div>

            <div className="mt-6 space-y-3"></div>
          </div>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <section className="relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">
                O&apos;xshash hujjatlar
              </h2>
            </div>

            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4 pb-4">
                {relatedProducts.map((p, i) => (
                  <CarouselItem
                    key={i}
                    className="pl-4 md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="h-full">
                      <ProductCard product={p} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden sm:block">
                <CarouselPrevious className="-left-4 lg:-left-12" />
                <CarouselNext className="-right-4 lg:-right-12" />
              </div>
            </Carousel>
          </section>
        )}
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        product={data}
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />
    </>
  );
}
