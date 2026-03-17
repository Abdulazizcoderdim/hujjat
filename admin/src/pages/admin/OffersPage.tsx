import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/hooks/formatDateTime";
import $api from "@/http/axios";
import { IOffer, IPagination, IUser } from "@/interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Reply,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface OffersResponse {
  items: IOffer<IUser>[];
  pagination: IPagination;
}

export const OffersPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal States
  const [isRespondOpen, setIsRespondOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<IOffer<IUser> | null>(
    null,
  );
  const [responseText, setResponseText] = useState("");

  const { data } = useQuery<OffersResponse>({
    queryKey: ["admin-offers", page, limit],
    queryFn: async () => {
      const res = await $api.get(`/offers/admin?page=${page}&limit=${limit}`);
      return res.data;
    },
    placeholderData: (prev) =>
      prev ?? {
        items: [],
        pagination: { total: 0, page: 1, limit, totalPages: 1 },
      },
  });

  const respondMutation = useMutation({
    mutationFn: async (data: { id: string; response: string }) => {
      return await $api.patch(`/offers/${data.id}/respond`, {
        response: data.response,
      });
    },
    onSuccess: () => {
      toast.success("Javob muvaffaqiyatli yuborildi");
      setIsRespondOpen(false);
      setResponseText("");
      setSelectedOffer(null);
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await $api.delete(`/offers/${id}`);
    },
    onSuccess: () => {
      toast.success("Taklif o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
    },
    onError: () => toast.error("O'chirishda xatolik"),
  });

  const handleOpenRespond = (offer: IOffer<IUser>) => {
    setSelectedOffer(offer);
    setResponseText(offer.response || "");
    setIsRespondOpen(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedOffer || !responseText.trim()) return;
    respondMutation.mutate({ id: selectedOffer._id, response: responseText });
  };

  const handleDelete = (id: string) => {
    if (confirm("Haqiqatan ham bu taklifni o'chirmoqchimisiz?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Takliflar va Shikoyatlar
        </h1>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          Jami: {data?.pagination.total}
        </span>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>№</TableHead>
              <TableHead>Foydalanuvchi</TableHead>
              <TableHead className="w-[40%]">Taklif mazmuni</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Takliflar mavjud emas
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((offer, index) => (
                <TableRow key={offer._id}>
                  <TableCell>
                    {(data.pagination?.page - 1) * data.pagination?.limit +
                      (index + 1)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {offer.userId?.full_name || "O'chirilgan user"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {offer.userId?.phone}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm whitespace-pre-wrap break-words">{offer.text}</p>
                    {offer.response && (
                      <div className="mt-1 flex items-start gap-1 text-xs text-emerald-600">
                        <Reply className="h-3 w-3 mt-0.5 shrink-0" />
                        <span className="whitespace-pre-wrap break-words">
                          {offer.response}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateTime(offer.createdAt)}
                  </TableCell>
                  <TableCell>
                    {offer.response ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                        Javob berilgan
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-500">
                        Yangi
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Amallar</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleOpenRespond(offer)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Javob yozish
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(offer._id)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          O'chirish
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={data?.pagination?.totalPages ?? 1}
        limit={limit}
        total={data?.pagination?.total}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => setLimit(l)}
      />

      {/* Respond Modal */}
      <Dialog open={isRespondOpen} onOpenChange={setIsRespondOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Taklifga javob berish</DialogTitle>
            <DialogDescription>
              Foydalanuvchi:{" "}
              <span className="font-medium text-foreground">
                {selectedOffer?.userId?.full_name}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              "{selectedOffer?.text}"
            </div>
            <Textarea
              placeholder="Javobingizni bu yerga yozing..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRespondOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={respondMutation.isPending}
            >
              {respondMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Yuborish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
