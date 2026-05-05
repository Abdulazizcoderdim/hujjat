import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/common/Pagination";
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
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { ICategory, IPagination } from "@/interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

interface CategoryResponse {
  items: ICategory[];
  pagination: IPagination;
}

export function CategoriesPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
  });

  const { data, isLoading } = useQuery<CategoryResponse>({
    queryKey: ["categories", { page, debouncedSearch, limit }],
    queryFn: async () => {
      const { data } = await $api.get("/categories", {
        params: {
          page,
          limit,
          search: debouncedSearch,
        },
      });
      return data;
    },
    placeholderData: (prev) =>
      prev ?? {
        items: [],
        pagination: { total: 0, page: 1, limit, totalPages: 1 },
      },
  });

  const categories: ICategory[] = data?.items ?? [];
  const pagination = data?.pagination;

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; icon?: string }) => {
      const { data } = await $api.post("/categories", payload);
      return data;
    },
    onSuccess: () => {
      toast({ title: "Kategoriya qo‘shildi" });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: { name: string; icon?: string };
    }) => {
      const { data } = await $api.patch(`/categories/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      toast({ title: "Kategoriya yangilandi" });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsFormOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await $api.delete(`/categories/${id}`);
      return data;
    },
    onSuccess: () => {
      toast({ title: "Kategoriya o‘chirildi" });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsDeleteOpen(false);
    },
  });

  const handleCreate = () => {
    setSelectedCategory(null);
    setFormData({ name: "", icon: "" });
    setIsFormOpen(true);
  };

  const handleEdit = (category: ICategory) => {
    setSelectedCategory(category);
    setFormData({ name: category.name, icon: category.icon ?? "" });
    setIsFormOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Xatolik",
        description: "Kategoriya nomini kiriting",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      icon: formData.icon.trim() || undefined,
    };

    if (selectedCategory) {
      updateMutation.mutate({
        id: selectedCategory.id,
        payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = () => {
    if (!selectedCategory) return;
    deleteMutation.mutate(selectedCategory.id);
  };

  const columns = [
    {
      key: "icon" as keyof ICategory,
      header: "Ikonka",
      className: "w-20",
      render: (c: ICategory) => <span className="text-2xl">{c.icon}</span>,
    },
    {
      key: "name" as keyof ICategory,
      header: "Nomi",
      render: (c: ICategory) => <span className="font-medium">{c.name}</span>,
    },
    {
      key: "createdAt" as keyof ICategory,
      header: "Yaratilgan sana",
      render: (c: ICategory) =>
        new Date(c.createdAt).toLocaleDateString("uz-UZ"),
    },
    {
      key: "id" as keyof ICategory,
      header: "Amallar",
      className: "w-28",
      render: (c: ICategory) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => handleEdit(c)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setSelectedCategory(c);
              setIsDeleteOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategoriyalar"
        description="Mahsulot kategoriyalarini boshqarish"
      />

      {/* Search + Create */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Kategoriya qidirish..."
            className="pl-9"
          />
        </div>

        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Yangi kategoriya
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={categories}
        columns={columns}
        keyExtractor={(c) => c.id}
        emptyMessage="Kategoriyalar topilmadi"
      />

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        limit={limit}
        total={pagination?.total}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => setLimit(l)}
      />
      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory
                ? "Kategoriyani tahrirlash"
                : "Yangi kategoriya"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Nomi</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-3">
              <Label>Ikonka (emoji, ixtiyoriy)</Label>
              <Input
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                placeholder="📚"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleSubmit}>
              {selectedCategory ? "Saqlash" : "Qo‘shish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Kategoriyani o‘chirish"
        description={`"${selectedCategory?.name}" kategoriyasi o‘chirilsinmi?`}
        confirmLabel="O‘chirish"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
