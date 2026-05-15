import { ProductStatusBadge } from "@/components/admin/ProductStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ICategory, ICurriculumLink, IProduct } from "@/interface";
import {
  fetchCurriculumLinks,
  fetchCurriculums,
  fetchSemesters,
  fetchSubjects,
} from "@/service/edusystem";
import { isEduConfigured } from "@/http/edusystem";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  FileText,
  Globe,
  GraduationCap,
  Hash,
  Star,
  User,
} from "lucide-react";

export function ViewProductModal({
  product,
  isOpen,
  onClose,
}: {
  product: IProduct<ICategory>;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: links } = useQuery<ICurriculumLink[]>({
    queryKey: ["product-curriculum-links", product?.id],
    queryFn: () => fetchCurriculumLinks(product.id),
    enabled: !!product?.id && isOpen && !!product?.isCurriculumBook,
  });

  const { data: curriculums } = useQuery({
    queryKey: ["edu", "curriculums"],
    queryFn: fetchCurriculums,
    enabled: isEduConfigured && !!links?.length,
    staleTime: 5 * 60 * 1000,
  });
  const { data: subjects } = useQuery({
    queryKey: ["edu", "subjects", "curriculum-only"],
    queryFn: () => fetchSubjects(true),
    enabled: isEduConfigured && !!links?.length,
    staleTime: 5 * 60 * 1000,
  });
  const { data: semesters } = useQuery({
    queryKey: ["edu", "semesters"],
    queryFn: fetchSemesters,
    enabled: isEduConfigured && !!links?.length,
    staleTime: 5 * 60 * 1000,
  });

  if (!product) return null;

  const curriculumNameById = new Map(
    (curriculums ?? []).map((c) => [c.id, c.name]),
  );
  const subjectNameById = new Map((subjects ?? []).map((s) => [s.id, s.name]));
  const semesterNameByValue = new Map(
    (semesters ?? []).map((s) => [s.value ?? s.id, s.name]),
  );

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

            {product.isCurriculumBook && (
              <div className="pt-2 border-t">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Biriktirilgan o'quv rejalar
                </p>
                {links === undefined ? (
                  <p className="text-xs text-muted-foreground">Yuklanmoqda...</p>
                ) : links.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Biriktirish yo'q
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {links.map((l) => (
                      <li
                        key={l.id}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                          {l.semester}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate">
                            {curriculumNameById.get(l.curriculumId) ??
                              `O'quv reja #${l.curriculumId}`}
                            {" — "}
                            {semesterNameByValue.get(l.semester) ??
                              `${l.semester}-semestr`}
                            {", "}
                            {subjectNameById.get(l.subjectId) ??
                              `Fan #${l.subjectId}`}
                          </p>
                          {l.isMain && (
                            <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                              <Star className="h-3 w-3 fill-current" />
                              Asosiy darslik
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
