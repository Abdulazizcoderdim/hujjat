import { ICategory, IProduct } from "@/interface";
import { FileText } from "lucide-react";
import { Button } from "./ui/button";

export const RenderPreview = ({
  product,
  signedUrl,
  fetchSignedUrl,
  loadingFile,
}: {
  product: IProduct<ICategory>;
  signedUrl: string;
  fetchSignedUrl: () => void;
  loadingFile: boolean;
}) => {
  const ext = product.fileExt?.toLowerCase();
  if (!signedUrl) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-muted rounded-lg">
        <Button onClick={fetchSignedUrl} disabled={loadingFile}>
          {loadingFile ? "Yuklanmoqda..." : "Preview yuklash"}
        </Button>
      </div>
    );
  }

  switch (ext) {
    case "pdf":
      return (
        <div className="w-full h-[600px] bg-muted rounded-lg overflow-hidden">
          <iframe
            src={signedUrl}
            width="100%"
            height="600"
            style={{ border: "none" }}
            loading="lazy"
          />
        </div>
      );

    case "doc":
    case "docx":
    case "ppt":
    case "pptx":
      return (
        <div className="w-full h-[600px] bg-muted rounded-lg overflow-hidden">
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
              signedUrl,
            )}`}
            width="100%"
            height="600"
            style={{ border: "none" }}
            loading="lazy"
          />
        </div>
      );

    default:
      return (
        <div className="w-full h-[600px] bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <FileText
              className="mx-auto mb-4 text-muted-foreground"
              size={48}
            />
            <p className="text-muted-foreground">
              Bu format uchun preview mavjud emas
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Fayl turi: {ext?.toUpperCase()}
            </p>
          </div>
        </div>
      );
  }
};
