import {
  ArrowLeft,
  BookOpen,
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface PDFReaderProps {
  url: string;
  title?: string;
  author?: string;
  onClose: () => void;
}

const PDFReader = ({ url, title, author, onClose }: PDFReaderProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageInput, setPageInput] = useState("1");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getPdfUrl = useCallback(() => {
    return `${url}#zoom=${zoom}&page=${currentPage}&toolbar=0&navpanes=0&scrollbar=1`;
  }, [url, zoom, currentPage]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50));

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    setCurrentPage(page);
    setPageInput(String(page));
  };

  const handlePageInputBlur = () => {
    const parsed = parseInt(pageInput);
    if (!isNaN(parsed) && parsed >= 1) {
      setCurrentPage(parsed);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        handlePageChange(currentPage + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        handlePageChange(currentPage - 1);
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-") handleZoomOut();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentPage, onClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-[#1a1a1a] text-white"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <div className="h-12 flex-shrink-0 flex items-center justify-between px-4 bg-[#2a2a2a] border-b border-white/10 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Chiqish</span>
          </button>

          <div className="w-px h-5 bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2 min-w-0">
            <BookOpen
              className="w-4 h-4 text-primary flex-shrink-0"
              strokeWidth={1.5}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">
                {title ?? "Kitob"}
              </p>
              {author && (
                <p className="text-[11px] text-white/40 truncate leading-tight">
                  {author}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            title="Kichraytirish (-)"
          >
            <ZoomOut className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <span className="text-xs text-white/50 w-10 text-center tabular-nums">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            title="Kattalashtirish (+)"
          >
            <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <a
            href={url}
            download
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            title="Yuklab olish"
          >
            <Download className="w-4 h-4" strokeWidth={1.5} />
          </a>
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            title="To'liq ekran (F)"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" strokeWidth={1.5} />
            ) : (
              <Maximize2 className="w-4 h-4" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex items-stretch bg-[#141414]">
        <iframe
          ref={iframeRef}
          src={getPdfUrl()}
          className="w-full h-full border-0"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            width: `${(100 * 100) / zoom}%`,
            height: `${(100 * 100) / zoom}%`,
            zoom: `${zoom}%`,
          }}
          title={title ?? "PDF"}
          allow="fullscreen"
        />
      </div>
    </div>
  );
};

export default PDFReader;
