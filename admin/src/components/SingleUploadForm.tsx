import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { ICategory } from "@/interface";
import { File, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface SingleUploadFormProps {
  categories: ICategory[];
  onSubmit: (
    data: FormData,
    onProgress: (percent: number) => void,
  ) => Promise<void> | void;
}

export function SingleUploadForm({
  categories,
  onSubmit,
}: SingleUploadFormProps) {
  const [poster, setPoster] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    tags: "",
    poster: "",
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setIsUploading(true);
    e.preventDefault();
    if (!file || isUploading) return;

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("categoryId", formData.categoryId);
      data.append("tags", formData.tags);
      data.append("poster", poster as File);

      await onSubmit(data, (p) => setProgress(p));

      setProgress(100);

      setFile(null);
      setFormData({
        name: "",
        description: "",
        categoryId: "",
        tags: "",
        poster: "",
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 300);
    }
  };

  const isValid =
    file && formData.name && formData.description && formData.categoryId;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Hujjat yuklash</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div
            className={`
              border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
              ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
              ${file ? "bg-muted/50" : ""}
              ${isUploading ? "pointer-events-none opacity-80" : ""}
            `}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => {
              if (!isUploading) fileInputRef.current?.click();
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              disabled={isUploading}
            />

            {file ? (
              <div className="flex items-center justify-center gap-3">
                <File className="h-8 w-8 text-primary" />
                <div className="text-left min-w-0 flex-1">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isUploading}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  Faylni bu yerga tashlang yoki{" "}
                  <span className="text-primary font-medium">
                    tanlash uchun bosing
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX, PPT, PPTX
                </p>
              </div>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Yuklanmoqda...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="space-y-2">
            <Label>Poster (rasm)</Label>

            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setPoster(e.target.files?.[0] || null)}
              disabled={isUploading}
            />

            {poster && (
              <p className="text-sm text-muted-foreground">{poster.name}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Hujjat nomi *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Hujjat nomini kiriting"
                required
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Tavsif *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Hujjat haqida batafsil ma'lumot"
                rows={3}
                disabled={isUploading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategoriya *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
                disabled={isUploading}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tags">
                Kalit so'zlar (vergul bilan ajrating)
              </Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="masalan: pdf, kitob, qo'llanma"
                disabled={isUploading}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? `Yuklanmoqda: ${progress}%` : "Yuklash"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
