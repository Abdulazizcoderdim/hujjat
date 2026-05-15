import {
  CurriculumLinkValue,
  CurriculumLinksFieldset,
} from "@/components/CurriculumLinksFieldset";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ICategory } from "@/interface";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardPaste,
  FileText,
  GraduationCap,
  Hash,
  ImageIcon,
  Languages,
  Loader2,
  Tag,
  Upload,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const ALLOWED_DOC_EXT = [".pdf", ".doc", ".docx", ".ppt", ".pptx"];
const MAX_DOC_SIZE_MB = 200;
const MAX_POSTER_SIZE_MB = 10;

interface SingleUploadFormProps {
  categories: ICategory[];
  onSubmit: (
    data: FormData,
    onProgress: (percent: number) => void,
  ) => Promise<void> | void;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const initialForm = {
  name: "",
  description: "",
  categoryId: "",
  tags: "",
  pages: "",
  author: "",
  year: "",
  language: "",
};

type FormState = typeof initialForm;
type Errors = Partial<Record<keyof FormState | "file" | "poster", string>>;

export function SingleUploadForm({
  categories,
  onSubmit,
}: SingleUploadFormProps) {
  const [poster, setPoster] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [isFileDragging, setIsFileDragging] = useState(false);
  const [isPosterDragging, setIsPosterDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pasteFlash, setPasteFlash] = useState(false);
  const [isCurriculumBook, setIsCurriculumBook] = useState(false);
  const [curriculumLinks, setCurriculumLinks] = useState<CurriculumLinkValue[]>(
    [],
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!poster) {
      setPosterPreview(null);
      return;
    }
    const url = URL.createObjectURL(poster);
    setPosterPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [poster]);

  // Ctrl+V paste — accepts an image from the clipboard as the poster
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (isUploading) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (!blob) continue;
          const ext = (blob.type.split("/")[1] || "png").toLowerCase();
          const named =
            blob.name && blob.name !== "image.png"
              ? blob
              : new File([blob], `poster-${Date.now()}.${ext}`, {
                  type: blob.type,
                });
          applyPoster(named as File);
          setPasteFlash(true);
          setTimeout(() => setPasteFlash(false), 700);
          return;
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUploading]);

  const validateDocument = (f: File | null) => {
    if (!f) return null;
    const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_DOC_EXT.includes(ext)) return "Faqat PDF qabul qilinadi";
    if (f.size > MAX_DOC_SIZE_MB * 1024 * 1024)
      return `Fayl hajmi ${MAX_DOC_SIZE_MB}MB dan oshmasligi kerak`;
    return null;
  };

  const validatePoster = (f: File | null) => {
    if (!f) return null;
    if (!f.type.startsWith("image/")) return "Faqat rasm fayli qabul qilinadi";
    if (f.size > MAX_POSTER_SIZE_MB * 1024 * 1024)
      return `Rasm hajmi ${MAX_POSTER_SIZE_MB}MB dan oshmasligi kerak`;
    return null;
  };

  const applyFile = (f: File | null) => {
    const err = validateDocument(f);
    setErrors((prev) => ({ ...prev, file: err || undefined }));
    if (err) return;
    setFile(f);
  };

  const applyPoster = (f: File | null) => {
    const err = validatePoster(f);
    setErrors((prev) => ({ ...prev, poster: err || undefined }));
    if (err) return;
    setPoster(f);
  };

  const linkErrors = useMemo(() => {
    if (!isCurriculumBook) return null;
    if (curriculumLinks.length === 0)
      return "Kamida bitta biriktirish qo'shing yoki tickni olib tashlang";
    const seen = new Set<string>();
    for (const l of curriculumLinks) {
      if (!l.curriculumId || !l.semester || !l.subjectId)
        return "Har bir biriktirishda o'quv reja, semestr va fan tanlanishi kerak";
      const key = `${l.curriculumId}-${l.semester}-${l.subjectId}`;
      if (seen.has(key)) return "Bir xil biriktirish takrorlangan";
      seen.add(key);
    }
    return null;
  }, [isCurriculumBook, curriculumLinks]);

  const validateAll = (): boolean => {
    const next: Errors = {};
    if (!file) next.file = "Fayl tanlanmagan";
    if (!formData.name.trim()) next.name = "Hujjat nomini kiriting";
    if (!formData.description.trim()) next.description = "Tavsifni kiriting";
    if (!formData.categoryId) next.categoryId = "Kategoriya tanlang";
    if (formData.year) {
      const y = Number(formData.year);
      const max = new Date().getFullYear() + 1;
      if (y < 1000 || y > max)
        next.year = `Yil 1000–${max} oralig'ida bo'lishi kerak`;
    }
    if (formData.pages && Number(formData.pages) < 1) {
      next.pages = "Sahifa soni 1 dan kam bo'lmasin";
    }
    setErrors(next);
    return Object.keys(next).length === 0 && !linkErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    if (!validateAll()) return;

    setIsUploading(true);
    setProgress(0);

    try {
      const data = new FormData();
      data.append("file", file!);
      if (poster) data.append("poster", poster);
      data.append("name", formData.name.trim());
      data.append("description", formData.description.trim());
      data.append("categoryId", formData.categoryId);
      data.append("tags", formData.tags);
      data.append("pages", formData.pages);
      data.append("author", formData.author);
      data.append("year", formData.year);
      data.append("language", formData.language);
      data.append("isCurriculumBook", String(isCurriculumBook));
      if (isCurriculumBook && curriculumLinks.length) {
        data.append(
          "curriculumLinks",
          JSON.stringify(
            curriculumLinks.map((l) => ({
              curriculumId: Number(l.curriculumId),
              semester: Number(l.semester),
              subjectId: Number(l.subjectId),
              isMain: l.isMain,
            })),
          ),
        );
      }

      await onSubmit(data, (p) => setProgress(p));

      setProgress(100);
      handleReset();
    } catch {
      // parent shows error toast; keep values for retry
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 400);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPoster(null);
    setFormData(initialForm);
    setErrors({});
    setIsCurriculumBook(false);
    setCurriculumLinks([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (posterInputRef.current) posterInputRef.current.value = "";
  };

  const tagsList = useMemo(
    () =>
      formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [formData.tags],
  );

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsFileDragging(false);
    if (isUploading) return;
    const f = e.dataTransfer.files[0];
    if (f) applyFile(f);
  };

  const handlePosterDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPosterDragging(false);
    if (isUploading) return;
    const f = e.dataTransfer.files[0];
    if (f) applyPoster(f);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {/* Document */}
          <Card className="">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Hujjat fayli
                <span className="ml-1 text-destructive">*</span>
              </CardTitle>
              <CardDescription>
                PDF — maksimal {MAX_DOC_SIZE_MB}MB
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                role="button"
                tabIndex={isUploading ? -1 : 0}
                aria-label="Hujjat faylini tanlash yoki tashlab qo'yish"
                aria-invalid={!!errors.file}
                aria-describedby={errors.file ? "file-error" : undefined}
                className={[
                  "group relative rounded-xl border-2 border-dashed transition-all duration-200",
                  isFileDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/30",
                  errors.file ? "border-destructive/60 bg-destructive/5" : "",
                  file ? "bg-muted/40" : "",
                  isUploading
                    ? "pointer-events-none opacity-70"
                    : "cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                ].join(" ")}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsFileDragging(true);
                }}
                onDragLeave={() => setIsFileDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={ALLOWED_DOC_EXT.join(",")}
                  onChange={(e) => applyFile(e.target.files?.[0] || null)}
                  disabled={isUploading}
                />

                {file ? (
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-sm text-muted-foreground tabular-nums">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Faylni olib tashlash"
                      disabled={isUploading}
                      onClick={(e) => {
                        e.stopPropagation();
                        applyFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                    <div
                      className={[
                        "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
                        isFileDragging
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                      ].join(" ")}
                    >
                      <Upload className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">Faylni shu yerga tashlang</p>
                      <p className="text-sm text-muted-foreground">
                        yoki{" "}
                        <span className="font-medium text-primary underline-offset-4 group-hover:underline">
                          tanlash uchun bosing
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {errors.file && (
                <p
                  id="file-error"
                  className="mt-2 flex items-center gap-1.5 text-xs text-destructive"
                  role="alert"
                >
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.file}
                </p>
              )}

              {isUploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Yuklanmoqda...
                    </span>
                    <span className="font-mono tabular-nums">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" />
                Asosiy ma'lumotlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Hujjat nomi <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="masalan: O'tgan kunlar"
                  disabled={isUploading}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  autoComplete="off"
                />
                {errors.name && (
                  <p
                    id="name-error"
                    className="flex items-center gap-1.5 text-xs text-destructive"
                    role="alert"
                  >
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Tavsif <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Hujjat haqida qisqacha ma'lumot..."
                  rows={4}
                  disabled={isUploading}
                  aria-invalid={!!errors.description}
                  aria-describedby={
                    errors.description
                      ? "description-error"
                      : "description-hint"
                  }
                />
                {errors.description ? (
                  <p
                    id="description-error"
                    className="flex items-center gap-1.5 text-xs text-destructive"
                    role="alert"
                  >
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.description}
                  </p>
                ) : (
                  <p
                    id="description-hint"
                    className="text-xs text-muted-foreground"
                  >
                    Foydalanuvchilarga hujjat mazmunini tushunishga yordam
                    beradi.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Kategoriya <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, categoryId: value }))
                  }
                  disabled={isUploading}
                >
                  <SelectTrigger
                    id="category"
                    aria-invalid={!!errors.categoryId}
                  >
                    <SelectValue placeholder="Kategoriyani tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.icon ? (
                            <span className="mr-2">{cat.icon}</span>
                          ) : null}
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled value="no-categories">
                        Kategoriyalar mavjud emas
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p
                    className="flex items-center gap-1.5 text-xs text-destructive"
                    role="alert"
                  >
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.categoryId}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          {/* Poster */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-4 w-4 text-primary" />
                Poster
              </CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-1.5">
                <ClipboardPaste className="h-3.5 w-3.5" />
                Tashlang, tanlang yoki{" "}
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] leading-none">
                  Ctrl
                </kbd>{" "}
                +{" "}
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] leading-none">
                  V
                </kbd>{" "}
                bilan joylang
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                role="button"
                tabIndex={isUploading ? -1 : 0}
                aria-label="Posterni tanlash, tashlash yoki joylashtirish"
                aria-invalid={!!errors.poster}
                className={[
                  "group relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200",
                  isPosterDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/30",
                  pasteFlash ? "ring-2 ring-primary ring-offset-2" : "",
                  errors.poster ? "border-destructive/60 bg-destructive/5" : "",
                  isUploading
                    ? "pointer-events-none opacity-70"
                    : "cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                ].join(" ")}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsPosterDragging(true);
                }}
                onDragLeave={() => setIsPosterDragging(false)}
                onDrop={handlePosterDrop}
                onClick={() => !isUploading && posterInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    posterInputRef.current?.click();
                  }
                }}
              >
                <input
                  ref={posterInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => applyPoster(e.target.files?.[0] || null)}
                  disabled={isUploading}
                />

                {posterPreview && poster ? (
                  <>
                    <img
                      src={posterPreview}
                      alt="Poster oldindan ko'rinishi"
                      className="absolute inset-0 h-full w-full object-cover blur-xl opacity-30"
                      aria-hidden
                    />
                    <div className="relative flex w-full items-center gap-3 p-4">
                      <img
                        src={posterPreview}
                        alt="Poster"
                        className="h-32 w-24 shrink-0 rounded-md object-cover shadow-md ring-1 ring-border"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p
                          className="truncate text-sm font-medium"
                          title={poster.name}
                        >
                          {poster.name}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {formatBytes(poster.size)}
                        </p>
                        <Badge
                          variant="secondary"
                          className="gap-1 font-normal"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Tayyor
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Posterni olib tashlash"
                        disabled={isUploading}
                        onClick={(e) => {
                          e.stopPropagation();
                          applyPoster(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                    <div
                      className={[
                        "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
                        isPosterDragging
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                      ].join(" ")}
                    >
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Rasmni tashlang yoki bosing
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG, WebP — maks. {MAX_POSTER_SIZE_MB}MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {errors.poster && (
                <p
                  className="mt-2 flex items-center gap-1.5 text-xs text-destructive"
                  role="alert"
                >
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.poster}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Optional metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="h-4 w-4 text-primary" />
                Qo'shimcha ma'lumotlar
              </CardTitle>
              <CardDescription>Ixtiyoriy maydonlar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="author"
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Muallif
                  </Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    placeholder="Abdulla Qodiriy"
                    disabled={isUploading}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="language"
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <Languages className="h-3.5 w-3.5 text-muted-foreground" />
                    Til
                  </Label>
                  <Input
                    id="language"
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                    placeholder="O'zbekcha"
                    disabled={isUploading}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="pages"
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    Sahifalar
                  </Label>
                  <Input
                    id="pages"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={formData.pages}
                    onChange={(e) =>
                      setFormData({ ...formData, pages: e.target.value })
                    }
                    placeholder="240"
                    disabled={isUploading}
                    aria-invalid={!!errors.pages}
                  />
                  {errors.pages && (
                    <p
                      className="flex items-center gap-1.5 text-xs text-destructive"
                      role="alert"
                    >
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.pages}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="year"
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Yil
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    inputMode="numeric"
                    min={1000}
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    placeholder="2024"
                    disabled={isUploading}
                    aria-invalid={!!errors.year}
                  />
                  {errors.year && (
                    <p
                      className="flex items-center gap-1.5 text-xs text-destructive"
                      role="alert"
                    >
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.year}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Kalit so'zlar</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="masalan: roman, klassik, adabiyot"
                  disabled={isUploading}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Vergul (,) bilan ajrating
                </p>
                {tagsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tagsList.map((t, i) => (
                      <Badge
                        key={`${t}-${i}`}
                        variant="secondary"
                        className="font-normal"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Curriculum section */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4 text-primary" />
                O'quv reja kitobimi?
              </CardTitle>
              <CardDescription>
                Sillabusda berilgan o'quv reja kitobi bo'lsa, biriktirishlarni
                qo'shing
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isCurriculumBook"
                checked={isCurriculumBook}
                onCheckedChange={(v) => {
                  setIsCurriculumBook(v);
                  if (!v) setCurriculumLinks([]);
                }}
                disabled={isUploading}
              />
              <Label
                htmlFor="isCurriculumBook"
                className="cursor-pointer text-sm font-medium"
              >
                {isCurriculumBook ? "Ha" : "Yo'q"}
              </Label>
            </div>
          </div>
        </CardHeader>
        {isCurriculumBook && (
          <CardContent>
            <CurriculumLinksFieldset
              value={curriculumLinks}
              onChange={setCurriculumLinks}
              disabled={isUploading}
            />
            {linkErrors && (
              <p
                className="mt-3 flex items-center gap-1.5 text-xs text-destructive"
                role="alert"
              >
                <AlertCircle className="h-3.5 w-3.5" /> {linkErrors}
              </p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Action bar */}
      <div className="sticky bottom-0 -mx-4 border-t bg-background/85 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          {isUploading && (
            <div className="mr-auto flex min-w-0 flex-1 items-center gap-3 text-sm">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
              <div className="min-w-0">
                <p className="truncate font-medium">Yuklanmoqda...</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {progress}%
                </p>
              </div>
              <Progress value={progress} className="h-1.5 max-w-[180px]" />
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            disabled={isUploading}
            onClick={handleReset}
          >
            Tozalash
          </Button>
          <Button
            type="submit"
            disabled={isUploading}
            className="min-w-[140px] gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {progress}%
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Yuklash
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
