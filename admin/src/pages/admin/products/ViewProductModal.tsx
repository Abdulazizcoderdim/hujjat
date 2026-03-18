import { ProductStatusBadge } from "@/components/admin/ProductStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ICategory, IProduct } from "@/interface";
import { Calendar, FileText, Globe, Hash, User } from "lucide-react";

export function ViewProductModal({
  product,
  isOpen,
  onClose,
}: {
  product: IProduct<ICategory>;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!product) return null;

  console.log("Product>>>>>>>>>>>>>>>>", product);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mahsulot tafsilotlari</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Chap tomon: Poster */}
          <div className="space-y-4">
            <img
              src={product.poster || "/placeholder-image.png"}
              className="w-full aspect-[3/4] object-cover rounded-lg border shadow-sm"
              alt={product.name}
            />

            <Button className="w-full" variant="outline" asChild>
              <a href={product.fileUrl} target="_blank" rel="noreferrer">
                <FileText className="mr-2 h-4 w-4" /> Hujjatni ochish (
                {(product.fileSize / 1024 / 1024).toFixed(2)} MB)
              </a>
            </Button>
          </div>

          {/* O'ng tomon: Ma'lumotlar */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <ProductStatusBadge status={product.status} />
            </div>

            <p className="text-muted-foreground whitespace-pre-wrap">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 opacity-70" />
                <span className="text-sm font-medium">
                  {product.author || "Noma'lum"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 opacity-70" />
                <span className="text-sm">
                  {product.year || "Yil kiritilmagan"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 opacity-70" />
                <span className="text-sm">
                  {product.language || "Til kiritilmagan"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 opacity-70" />
                <span className="text-sm">{product.pages} sahifa</span>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                Kategoriya
              </p>
              <Badge>{product.category?.name}</Badge>
            </div>

            <div className="pt-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                Teglar
              </p>
              <div className="flex flex-wrap gap-1">
                {product.tags?.map((tag: string) => (
                  <Badge key={tag} className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
