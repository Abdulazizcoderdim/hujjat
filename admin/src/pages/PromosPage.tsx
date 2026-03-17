import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import $api from "@/http/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Image as ImageIcon, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const PromosPage = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);

  // Fetch data
  const { data: promos, isLoading } = useQuery({
    queryKey: ["promos"],
    queryFn: async () => {
      const { data } = await $api.get("/promos");
      return data;
    },
  });

  // Create/Update Mutation
  const mutation = useMutation({
    mutationFn: async (formData: any) => {
      if (editingPromo) {
        return $api.put(`/promos/${editingPromo._id}`, formData);
      }
      return $api.post("/promos", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promos"] });
      setIsOpen(false);
      setEditingPromo(null);
      toast.success("Muvaffaqiyatli saqlandi");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => $api.delete(`/promos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promos"] });
      toast.success("O'chirib tashlandi");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    mutation.mutate(data);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Promo Slayderlar</h1>
        <Dialog
          open={isOpen}
          onOpenChange={(val) => {
            setIsOpen(val);
            if (!val) setEditingPromo(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Yangi qo'shish
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPromo ? "Tahrirlash" : "Yangi promo"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label>Sarlavha (Title)</Label>
                <Input
                  name="title"
                  defaultValue={editingPromo?.title}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Tavsif (Description)</Label>
                <Input
                  name="description"
                  defaultValue={editingPromo?.description}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>CTA Tugma matni</Label>
                <Input
                  name="ctaText"
                  defaultValue={editingPromo?.ctaText}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>CTA Link (URL)</Label>
                <Input
                  name="ctaUrl"
                  defaultValue={editingPromo?.ctaUrl}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Thumbnail (Rasm URL)</Label>
                <Input
                  name="thumbnail"
                  defaultValue={editingPromo?.thumbnail}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Badge matni</Label>
                  <Input name="badge" defaultValue={editingPromo?.badge} />
                </div>
                <div className="grid gap-2">
                  <Label>Icon (nomi)</Label>
                  <Input
                    name="icon"
                    placeholder="youtube, telegram..."
                    defaultValue={editingPromo?.icon}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rasm</TableHead>
              <TableHead>Sarlavha</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            ) : (
              promos?.map((promo: any) => (
                <TableRow key={promo._id}>
                  <TableCell>
                    {promo.thumbnail ? (
                      <img
                        src={promo.thumbnail}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{promo.title}</TableCell>
                  <TableCell>{promo.badge}</TableCell>
                  <TableCell>{promo.isActive ? "Faol" : "Nofaol"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingPromo(promo);
                        setIsOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteMutation.mutate(promo._id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
