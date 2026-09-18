import { EntButton, EntDialog } from "@/components/enterprise";
import { useToast } from "@/hooks/use-toast";
import {
  downloadLabelPdf,
  downloadQrPng,
  fetchQrPngUrl,
  qrTargetUrl,
} from "@/service/qr";
import { Copy, Download, FileText, Printer } from "lucide-react";
import { useEffect, useState } from "react";

export interface QrPreviewProduct {
  id: number;
  name: string;
  author?: string | null;
  shelfCode?: string | null;
  udc?: string | null;
  qrScanCount?: number;
}

interface Props {
  product: QrPreviewProduct | null;
  onClose: () => void;
}

/** Bitta kitobning QR-kodi: oldindan ko'rish, PNG / yorliq PDF yuklab olish, chop etish. */
export function QrPreviewDialog({ product, onClose }: Props) {
  const { toast } = useToast();
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<"png" | "pdf" | null>(null);

  useEffect(() => {
    if (!product) {
      setPngUrl(null);
      return;
    }
    let url: string | null = null;
    let cancelled = false;
    fetchQrPngUrl(product.id, 320)
      .then((u) => {
        if (cancelled) URL.revokeObjectURL(u);
        else {
          url = u;
          setPngUrl(u);
        }
      })
      .catch(() =>
        toast({
          title: "Xato",
          description: "QR rasmini yuklab bo'lmadi",
          variant: "destructive",
        }),
      );
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [product?.id]);

  const run = async (kind: "png" | "pdf") => {
    if (!product) return;
    setBusy(kind);
    try {
      if (kind === "png") await downloadQrPng(product.id, product.name);
      else await downloadLabelPdf(product.id, product.name);
    } catch {
      toast({
        title: "Xato",
        description: "Yuklab olishda xato",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const printQr = () => {
    if (!pngUrl || !product) return;
    const w = window.open("", "_blank", "width=480,height=560");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>QR — ${escapeHtml(
      product.name,
    )}</title><style>
      body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:system-ui,sans-serif}
      img{width:70mm;height:70mm}
      h3{margin:8px 0 2px;font-size:14px;text-align:center;max-width:80mm}
      p{margin:0;font-size:11px;color:#444}
      @media print{@page{margin:8mm}}
    </style></head><body>
      <img src="${pngUrl}" onload="setTimeout(()=>{window.print();},150)"/>
      <h3>${escapeHtml(product.name)}</h3>
      ${product.author ? `<p>${escapeHtml(product.author)}</p>` : ""}
      <p>#${product.id}${product.shelfCode ? " · Shifr: " + escapeHtml(product.shelfCode) : ""}</p>
    </body></html>`);
    w.document.close();
  };

  const target = product ? qrTargetUrl(product.id) : "";

  return (
    <EntDialog
      open={!!product}
      onClose={onClose}
      title="Kitob QR-kodi"
      width={460}
      footer={
        <>
          <EntButton onClick={onClose}>Yopish</EntButton>
          <EntButton
            disabled={!pngUrl}
            onClick={printQr}
            title="Faqat QR'ni chop etish"
          >
            <Printer size={14} /> Chop etish
          </EntButton>
          <EntButton disabled={busy !== null} onClick={() => run("png")}>
            <Download size={14} /> {busy === "png" ? "..." : "PNG"}
          </EntButton>
          <EntButton
            variant="primary"
            disabled={busy !== null}
            onClick={() => run("pdf")}
            title="70×37 mm yorliq (PDF)"
          >
            <FileText size={14} /> {busy === "pdf" ? "..." : "Yorliq PDF"}
          </EntButton>
        </>
      }
    >
      {product && (
        <div className="ent-stack-y" style={{ alignItems: "center" }}>
          <div
            style={{
              width: 220,
              height: 220,
              border: "1px solid var(--ent-border)",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {pngUrl ? (
              <img
                src={pngUrl}
                alt={`QR — ${product.name}`}
                style={{ width: 200, height: 200, imageRendering: "pixelated" }}
              />
            ) : (
              <span className="ent-muted" style={{ fontSize: 12 }}>
                Yuklanmoqda...
              </span>
            )}
          </div>

          <div style={{ textAlign: "center", fontSize: 13 }}>
            <div style={{ fontWeight: 600 }}>{product.name}</div>
            {product.author && (
              <div className="ent-muted" style={{ fontSize: 12 }}>
                {product.author}
              </div>
            )}
            <div className="ent-muted" style={{ fontSize: 11, marginTop: 2 }}>
              #{product.id}
              {product.shelfCode ? ` · Shifr: ${product.shelfCode}` : ""}
              {product.udc ? ` · UDK: ${product.udc}` : ""}
              {typeof product.qrScanCount === "number"
                ? ` · ${product.qrScanCount} marta skanerlangan`
                : ""}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              width: "100%",
              border: "1px solid var(--ent-border)",
              background: "var(--ent-bg)",
              padding: "4px 8px",
              fontSize: 11,
            }}
          >
            <code
              className="ent-cell--code"
              style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}
              title={target}
            >
              {target}
            </code>
            <EntButton
              size="icon"
              title="Manzilni nusxalash"
              onClick={() =>
                navigator.clipboard
                  .writeText(target)
                  .then(() => toast({ title: "Nusxalandi" }))
                  .catch(() => undefined)
              }
            >
              <Copy size={12} />
            </EntButton>
          </div>
        </div>
      )}
    </EntDialog>
  );
}

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] as string,
  );

export default QrPreviewDialog;
