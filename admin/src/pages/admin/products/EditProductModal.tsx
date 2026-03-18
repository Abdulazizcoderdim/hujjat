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
import $api from "@/http/axios";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function EditProductModal({ id, isOpen, onClose, onSave }: any) {
  const [formData, setFormData] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);
  const [poster, setPoster] = useState<File | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["categories-list"],
    queryFn: async () =>
      (await $api.get("/categories", { params: { limit: 100 } })).data,
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ["product-detail", id],
    queryFn: async () => (await $api.get(`/products/${id}`)).data,
    enabled: !!id,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        categoryId: String(product.category?.id),
        tags: product.tags?.join(", "),
        author: product.author,
        pages: product.pages,
        year: product.year,
        language: product.language,
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });
    if (file) data.append("file", file);
    if (poster) data.append("poster", poster);
    onSave(data);
  };

  if (isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mahsulotni tahrirlash</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Nomi *</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Tavsif *</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Kategoriya *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(v) =>
                  setFormData({ ...formData, categoryId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategoriya tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.items.map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Muallif</Label>
              <Input
                value={formData.author || ""}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Sahifalar soni</Label>
              <Input
                type="number"
                value={formData.pages || ""}
                onChange={(e) =>
                  setFormData({ ...formData, pages: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Yil</Label>
              <Input
                type="number"
                value={formData.year || ""}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Til</Label>
              <Input
                value={formData.language || ""}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Teglar (vergul bilan)</Label>
              <Input
                value={formData.tags || ""}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
            </div>

            <div className="border-t col-span-2 pt-4 mt-2 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-blue-600">Yangi Hujjat yuklash</Label>
                <Input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-600">Yangi Poster yuklash</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPoster(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button type="submit">Saqlash</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
