import { ProductStatusBadge } from "@/components/admin/ProductStatusBadge";
import { RenderPreview } from "@/components/RenderPreview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { ICategory, IProduct } from "@/interface";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: IProduct<ICategory> | null;
}

interface CategoryResponse {
  id: string;
  name: string;
}

interface EditFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  tags: string;
  pages: number | undefined;
  images: string[];
}

export function EditProductDialog({
  open,
  onOpenChange,
  product,
}: EditProductDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<EditFormData>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    tags: "",
    pages: undefined,
    images: [],
  });

  const [editLoading, setEditLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  console.log("asdasda", signedUrl);

  // Categories ni olish
  const { data: categories } = useQuery<CategoryResponse[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await $api.get("/categories/findAll");
      return data;
    },
  });

  useEffect(() => {
    setSignedUrl(null);
  }, [product?.id]);

  const fetchSignedUrl = async () => {
    if (!product) return;

    try {
      setLoadingFile(true);
      const { data } = await $api.get<{ url: string }>(
        `/products/${product?.id}/download`,
      );

      setSignedUrl(data.url);
      return data.url;
    } finally {
      setLoadingFile(false);
    }
  };

  // Product ma'lumotlarini formga yuklash
  useEffect(() => {
    if (open && product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.category.id,
        tags: product.tags?.join(", ") || "",
        pages: product.pages,
        images: product.images || [],
      });
    } else {
      // Dialog yopilganda formni tozalash
      setFormData({
        name: "",
        description: "",
        price: 0,
        categoryId: "",
        tags: "",
        pages: undefined,
        images: [],
      });
    }
  }, [open, product]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);

    if (files.length + formData.images.length > 4) {
      toast({
        title: "Xatolik",
        description: "Maksimum 4 ta rasm yuklash mumkin",
        variant: "destructive",
      });
      return;
    }

    // Rasm format validatsiyasi
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    const invalidFiles = files.filter((f) => !validImageTypes.includes(f.type));

    if (invalidFiles.length > 0) {
      toast({
        title: "Xatolik",
        description: "Faqat JPG, PNG, WEBP formatdagi rasmlar qabul qilinadi",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const { data: uploadData } = await $api.post<{
          uploadUrl: string;
          key: string;
          publicUrl: string;
        }>("/storage/product-image/upload-url", {
          filename: file.name,
          contentType: file.type,
        });

        const uploadResponse = await fetch(uploadData.uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        uploadedUrls.push(uploadData.publicUrl);
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

      toast({
        title: "Muvaffaqiyatli",
        description: `${files.length} ta rasm yuklandi`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Xatolik",
        description: error?.message || "Rasmlarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) return;

    // Validatsiya
    if (formData.images.length === 0) {
      toast({
        title: "Xatolik",
        description: "Kamida 1 ta rasm yuklang",
        variant: "destructive",
      });
      return;
    }

    if (formData.price < 1000) {
      toast({
        title: "Xatolik",
        description: "Narx kamida 1000 so'm bo'lishi kerak",
        variant: "destructive",
      });
      return;
    }

    try {
      setEditLoading(true);

      // Faqat o'zgargan fieldlarni yuborish
      const updatePayload: any = {};

      if (formData.name !== product.name) {
        updatePayload.name = formData.name;
      }

      if (formData.description !== product.description) {
        updatePayload.description = formData.description;
      }

      if (formData.price !== product.price) {
        updatePayload.price = formData.price;
      }

      if (formData.categoryId !== product.category.id) {
        updatePayload.categoryId = formData.categoryId;
      }

      const newTags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const oldTags = product.tags || [];

      if (JSON.stringify(newTags) !== JSON.stringify(oldTags)) {
        updatePayload.tags = newTags;
      }

      if (formData.pages !== product.pages) {
        updatePayload.pages = formData.pages;
      }

      const oldImages = product.images || [];
      if (JSON.stringify(formData.images) !== JSON.stringify(oldImages)) {
        updatePayload.images = formData.images;
      }

      // Hech narsa o'zgarmagan bo'lsa
      if (Object.keys(updatePayload).length === 0) {
        toast({
          title: "Ma'lumot",
          description: "Hech qanday o'zgarish kiritilmadi",
        });
        onOpenChange(false);
        return;
      }

      await $api.put(`/products/${product.id}/edit`, updatePayload);

      toast({
        title: "Muvaffaqiyatli",
        description: "Mahsulot tahrirlandi va tasdiqlandi",
      });

      // Ma'lumotlarni yangilash
      queryClient.invalidateQueries({ queryKey: ["products/all"] });

      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Xatolik",
        description:
          error?.response?.data?.message ||
          "Mahsulotni tahrirlashda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Mahsulotni tahrirlash
          </DialogTitle>
        </DialogHeader>

        {product && (
          <>
            <div className="flex items-start flex-col gap-4">
              {product?.fileKey ? (
                <RenderPreview
                  product={product}
                  signedUrl={signedUrl}
                  fetchSignedUrl={fetchSignedUrl}
                  loadingFile={loadingFile}
                />
              ) : (
                <div className="h-24 w-24 rounded-xl bg-muted flex items-center justify-center">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {product.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <ProductStatusBadge status={product.status} />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nomi */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Nomi *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="bg-background border-border"
                  required
                />
              </div>

              {/* Tavsif */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">
                  Tavsif *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="bg-background border-border min-h-[100px]"
                  required
                />
              </div>

              {/* Narxi */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-foreground">
                  Narxi (so'm) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  min={1000}
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: Number(e.target.value),
                    }))
                  }
                  className="bg-background border-border"
                  required
                />
              </div>

              {/* Kategoriya */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">
                  Kategoriya *
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, categoryId: value }))
                  }
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Kategoriyani tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Teglar */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-foreground">
                  Teglar (vergul bilan ajrating)
                </Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  placeholder="masalan: kitob, dasturlash, python"
                  className="bg-background border-border"
                />
              </div>

              {/* Sahifalar soni */}
              <div className="space-y-2">
                <Label htmlFor="pages" className="text-foreground">
                  Sahifalar soni
                </Label>
                <Input
                  id="pages"
                  type="number"
                  min={1}
                  value={formData.pages || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pages: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="bg-background border-border"
                />
              </div>

              {/* Rasmlar */}
              <div className="space-y-2">
                <Label htmlFor="images" className="text-foreground">
                  Rasmlar (maksimum 4 ta) *
                </Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploadingImage || formData.images.length >= 4}
                  onChange={handleImageUpload}
                  className="bg-background border-border"
                />

                {/* Rasm preview */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Rasm ${index + 1}`}
                          className="h-24 w-full object-cover rounded-lg border border-border"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            Poster
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {uploadingImage && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Rasmlar yuklanmoqda...
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Birinchi rasm poster sifatida ishlatiladi
                </p>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={editLoading || uploadingImage}
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  disabled={
                    editLoading ||
                    uploadingImage ||
                    formData.images.length === 0
                  }
                >
                  {editLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Saqlash va tasdiqlash
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
