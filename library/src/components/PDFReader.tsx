import $api from "@/http/axios";
import { useMutation } from "@tanstack/react-query";
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
  userBookId: number; // API uchun userBook ID
  totalPages?: number; // Kitobning umumiy sahifa soni
  initialPage?: number; // Serverdan kelgan oxirgi sahifa
  onClose: () => void;
}

const LS_KEY = (id: number) => `pdf_last_page_${id}`;

const getSavedPage = (id: number, fallback: number): number => {
  try {
    const saved = localStorage.getItem(LS_KEY(id));
    return saved ? parseInt(saved, 10) : fallback;
  } catch {
    return fallback;
  }
};

const savePageToLS = (id: number, page: number) => {
  try {
    localStorage.setItem(LS_KEY(id), String(page));
  } catch {}
};

interface UpdateUserBookDto {
  progress?: number;
  lastPage?: number;
  isFinished?: boolean;
}

const useUpdateProgress = (userBookId: number) => {
  return useMutation({
    mutationFn: (dto: UpdateUserBookDto) =>
      $api.patch(`/user-books/${userBookId}`, dto).then((r) => r.data),
  });
};

const PDFReader = ({
  url,
  title,
  author,
  userBookId,
  totalPages,
  initialPage = 1,
  onClose,
}: PDFReaderProps) => {
  const startPage = getSavedPage(userBookId, initialPage);

  const [currentPage, setCurrentPage] = useState(startPage);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [pageInput, setPageInput] = useState("1");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { mutate: updateProgress } = useUpdateProgress(userBookId);

  const persistPage = useCallback(
    (page: number) => {
      savePageToLS(userBookId, page);

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const dto: UpdateUserBookDto = { lastPage: page };
        if (totalPages && totalPages > 0) {
          const progress = Math.min(100, Math.round((page / totalPages) * 100));
          dto.progress = progress;
          if (progress === 100) dto.isFinished = true;
        }
        updateProgress(dto);
      }, 2000);
    },
    [userBookId, totalPages, updateProgress],
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        savePageToLS(userBookId, currentPage);
        updateProgress({ lastPage: currentPage });
      }
    };
  }, [currentPage]);

  const getPdfUrl = useCallback(() => {
    return `${url}#zoom=${zoom}&page=${currentPage}&toolbar=0&navpanes=0&scrollbar=1`;
  }, [url, zoom, currentPage]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50));

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1) return;
      if (totalPages && page > totalPages) return;
      setCurrentPage(page);
      setPageInput(String(page));
      persistPage(page);
    },
    [totalPages, persistPage],
  );

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

  const progressPercent =
    totalPages && totalPages > 0
      ? Math.min(100, Math.round((currentPage / totalPages) * 100))
      : null;

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
          key={`${zoom}-${currentPage}`}
          ref={iframeRef}
          src={getPdfUrl()}
          className="w-full h-full border-0"
          style={{
            width: "100%",
            height: "100%",
          }}
          title={title ?? "PDF"}
          allow="fullscreen"
        />
      </div>
    </div>
  );
};

export default PDFReader;
