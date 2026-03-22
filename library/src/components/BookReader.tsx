import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize,
  Minimize,
  Minus,
  Moon,
  Plus,
  Sun,
  Type,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import HTMLFlipBook from "react-pageflip";
import { useNavigate, useParams } from "react-router-dom";

import $api from "@/http/axios";
import { ICategory, IProduct } from "@/interface";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PageProps, Theme, ThemeConfig, UserBookProgress } from "@/types";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

const WINDOW_SIZE = 3;

const THEMES: Record<Theme, ThemeConfig> = {
  light: {
    bg: "#FAFAF8",
    fg: "#1a1a1a",
    overlay: "rgba(238,236,234,0.96)",
    accent: "#3B6BF5",
    label: "Yorug'",
    icon: <Sun className="w-4 h-4" />,
  },
  sepia: {
    bg: "#F4ECD8",
    fg: "#3d2f1e",
    overlay: "rgba(232,220,200,0.96)",
    accent: "#8B5E3C",
    label: "Sepia",
    icon: <Type className="w-4 h-4" />,
  },
  dark: {
    bg: "#1C1C1E",
    fg: "#E0DDD5",
    overlay: "rgba(13,13,15,0.96)",
    accent: "#6B8AFF",
    label: "Qorong'u",
    icon: <Moon className="w-4 h-4" />,
  },
};

const getPageFilter = (theme: Theme) => {
  if (theme === "sepia") return "sepia(0.2) contrast(0.97)";
  if (theme === "dark") return "invert(1) hue-rotate(180deg) brightness(0.9)";
  return "none";
};

const Page = React.forwardRef<HTMLDivElement, PageProps>(
  ({ pageImage, pageNum, totalPages, theme }, ref) => {
    const cfg = THEMES[theme];
    return (
      <div
        ref={ref}
        className="relative w-full h-full overflow-hidden"
        style={{ backgroundColor: cfg.bg }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {pageImage ? (
          <img
            src={pageImage}
            alt={`Sahifa ${pageNum}`}
            className="w-full h-full"
            style={{
              objectFit: "contain",
              filter: getPageFilter(theme),
              display: "block",
            }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: cfg.fg, opacity: 0.15 }}
            />
          </div>
        )}

        <div
          className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-mono tracking-widest pointer-events-none"
          style={{ color: cfg.fg, opacity: 0.35 }}
        >
          {pageNum} / {totalPages}
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow:
              "inset -5px 0 14px -5px rgba(0,0,0,0.07), inset 5px 0 14px -5px rgba(0,0,0,0.04)",
          }}
        />
      </div>
    );
  },
);

Page.displayName = "Page";

function useBookDimensions() {
  const [dims, setDims] = useState(() => calcDims());

  function calcDims() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 640;
    const isPortrait = isMobile;

    if (isPortrait) {
      const w = Math.min(vw - 24, 380);
      const h = Math.min(vh * 0.72, w * 1.414);
      return { width: Math.round(w), height: Math.round(h), isMobile: true };
    } else {
      const maxW = Math.min((vw - 80) / 2, 420);
      const h = Math.min(vh * 0.82, maxW * 1.414);
      const w = Math.round(h / 1.414);
      return { width: w, height: Math.round(h), isMobile: false };
    }
  }

  useEffect(() => {
    const handle = () => setDims(calcDims());
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  return dims;
}

function useVirtualWindow(
  pages: (string | undefined)[],
  currentPage: number,
  windowSize: number = WINDOW_SIZE,
): (string | undefined)[] {
  return useMemo(() => {
    const start = Math.max(0, currentPage - windowSize);
    const end = Math.min(pages.length - 1, currentPage + windowSize);

    return pages.map((img, i) => {
      if (i >= start && i <= end) return img;
      return undefined; // placeholder
    });
  }, [pages, currentPage, windowSize]);
}

const BookReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const flipBookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pages, setPages] = useState<(string | undefined)[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingState, setLoadingState] = useState<"idle" | "loading" | "done">(
    "loading",
  );
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [theme, setTheme] = useState<Theme>("light");
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [renderReady, setRenderReady] = useState(false);

  const [maxReadPage, setMaxReadPage] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);

  const LS_MAX_PAGE_KEY = `pdf_max_page_book_${id}`;
  const LS_KEY = `pdf_last_page_book_${id}`;

  const getSavedPage = () => {
    try {
      return parseInt(localStorage.getItem(LS_KEY), 10);
    } catch {
      return 0;
    }
  };

  const getSavedMaxPage = () => {
    try {
      return parseInt(localStorage.getItem(LS_MAX_PAGE_KEY), 10);
    } catch {
      return 0;
    }
  };

  const { data: userBook, refetch: refetchUserBook } =
    useQuery<UserBookProgress>({
      queryKey: ["user-book", id],
      queryFn: async () => {
        const res = await $api.get(`/student-book/by-book/${id}`);
        return res.data;
      },
      enabled: !!id,
    });

  const {
    width: bookWidth,
    height: bookHeight,
    isMobile,
  } = useBookDimensions();

  const { data: book, isError } = useQuery<IProduct<ICategory>>({
    queryKey: ["book", id],
    queryFn: async () => {
      const res = await $api.get(`/products/books/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  console.log("book,.....");

  const { mutate: updateProgress } = useMutation({
    mutationFn: (dto: {
      lastPage?: number;
      progress?: number;
      isFinished?: boolean;
    }) => $api.patch(`/student-book/${userBook?.id}`, dto).then((r) => r.data),
    onSuccess: () => {
      refetchUserBook();
    },
  });

  const calculateProgress = useCallback(
    (pageNumber: number): number => {
      if (totalPages === 0) return 0;
      const readPages = pageNumber + 1;
      return Math.min(100, Math.round((readPages / totalPages) * 100));
    },
    [totalPages],
  );

  const saveProgress = useCallback(
    (currentPageNum: number) => {
      if (currentPageNum > maxReadPage) {
        const newMaxReadPage = currentPageNum;
        const newProgress = calculateProgress(newMaxReadPage);
        const isFinished = newProgress === 100;

        localStorage.setItem(LS_KEY, String(currentPageNum));
        localStorage.setItem(LS_MAX_PAGE_KEY, String(newMaxReadPage));
        setMaxReadPage(newMaxReadPage);

        if (userBook?.id) {
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
          saveTimerRef.current = setTimeout(() => {
            updateProgress({
              lastPage: currentPageNum,
              progress: newProgress,
              ...(isFinished && { isFinished: true }),
            });
          }, 2000);
        }
      } else {
        localStorage.setItem(LS_KEY, String(currentPageNum));

        if (userBook?.id) {
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
          saveTimerRef.current = setTimeout(() => {
            updateProgress({ lastPage: currentPageNum });
          }, 2000);
        }
      }
    },
    [maxReadPage, userBook?.id, calculateProgress, updateProgress],
  );

  const onFlip = useCallback(
    (e: { data: number }) => {
      const page = e.data;
      setCurrentPage(page);
      saveProgress(page);
    },
    [saveProgress],
  );

  useEffect(() => {
    if (!book?.fileUrl) return;
    let cancelled = false;

    const loadPdf = async () => {
      setLoadingState("loading");
      setPages([]);
      setTotalPages(0);
      setCurrentPage(0);
      setRenderReady(false);

      try {
        const loadingTask = pdfjsLib.getDocument({
          url: book.fileUrl,
          cMapUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/cmaps/",
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const numPages = pdf.numPages;
        setTotalPages(numPages);

        const buffer: (string | undefined)[] = new Array(numPages).fill(
          undefined,
        );
        setPages([...buffer]);

        const SCALE = window.devicePixelRatio >= 2 ? 1.5 : 2;
        const BATCH = 4;

        for (let i = 1; i <= numPages; i++) {
          if (cancelled) return;

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: SCALE });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          await page.render({ canvasContext: ctx, viewport }).promise;
          if (cancelled) return;

          buffer[i - 1] = canvas.toDataURL("image/jpeg", 0.82);
          setLoadingProgress(Math.round((i / numPages) * 100));

          if (i <= BATCH || i % 8 === 0 || i === numPages) {
            setPages([...buffer]);
          }

          if (i === Math.min(2, numPages)) {
            setRenderReady(true);
          }

          canvas.width = 0;
          canvas.height = 0;
        }

        if (!cancelled) {
          setPages([...buffer]);
          setLoadingState("done");
        }
      } catch (err) {
        console.error("PDF yuklashda xato:", err);
        if (!cancelled) setLoadingState("done");
      }
    };

    loadPdf();
    return () => {
      cancelled = true;
    };
  }, [book?.fileUrl]);

  const virtualPages = useVirtualWindow(pages, currentPage, WINDOW_SIZE);

  const goNext = useCallback(() => {
    flipBookRef.current?.pageFlip()?.flipNext();
  }, []);
  const goPrev = useCallback(() => {
    flipBookRef.current?.pageFlip()?.flipPrev();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "Escape") {
        if (document.fullscreenElement) document.exitFullscreen();
        else navigate(-1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, navigate]);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 3500);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [resetControlsTimer]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement)
        await containerRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const cfg = THEMES[theme];
  const progressPct =
    totalPages > 0 ? Math.round(((currentPage + 1) / totalPages) * 100) : 0;
  const isBookReady = renderReady && pages.filter(Boolean).length >= 1;

  useEffect(() => {
    if (!userBook || !isBookReady) return;

    const lsLastPage = getSavedPage();
    const lsMaxPage = getSavedMaxPage();
    const dbLastPage = userBook.lastPage ?? 0;
    const dbProgress = userBook.progress ?? 0;

    let startPage = 0;
    let maxPage = 0;

    if (dbProgress > 0 && totalPages > 0) {
      const estimatedMaxPage = Math.floor((dbProgress / 100) * totalPages) - 1;
      maxPage = Math.max(estimatedMaxPage, dbLastPage);
    }

    maxPage = Math.max(maxPage, lsMaxPage, lsLastPage);
    startPage = Math.max(dbLastPage, lsLastPage);

    if (maxPage > 0) setMaxReadPage(maxPage);

    if (startPage > 0 && flipBookRef.current) {
      setTimeout(() => {
        flipBookRef.current?.pageFlip()?.turnToPage(startPage);
        setCurrentPage(startPage);
      }, 300);
    }
  }, [userBook?.id, isBookReady, totalPages]);

  if (isError || book === null) {
    return (
      <div className="h-svh w-full flex flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-300">
        <BookOpen className="w-10 h-10 opacity-30" />
        <p className="text-sm opacity-50">Kitob topilmadi</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity"
        >
          Orqaga qaytish
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-svh w-full flex flex-col overflow-hidden relative"
      style={{
        backgroundColor:
          theme === "dark"
            ? "#0D0D0F"
            : theme === "sepia"
              ? "#E8DCC8"
              : "#EEECEA",
        transition: "background-color 0.4s ease",
        cursor: "default",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      <AnimatePresence>
        {showControls && (
          <motion.header
            key="top-bar"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="absolute top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-3 sm:px-5"
            style={{
              background: `linear-gradient(to bottom, ${cfg.overlay}, transparent)`,
            }}
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-70 active:scale-95"
              style={{ color: cfg.fg }}
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.8} />
              <span className="hidden sm:inline text-sm">Orqaga</span>
            </button>

            <div
              className="flex items-center gap-1.5 max-w-[40%] sm:max-w-[50%]"
              style={{ color: cfg.fg }}
            >
              <BookOpen
                className="w-4 h-4 flex-shrink-0 opacity-40"
                strokeWidth={1.5}
              />
              <span className="text-sm font-medium truncate opacity-60">
                {book?.name ?? ""}
              </span>
            </div>

            <div className="flex items-center gap-0.5">
              {(Object.keys(THEMES) as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className="p-2 rounded-lg transition-all active:scale-90"
                  style={{
                    color: cfg.fg,
                    opacity: theme === t ? 1 : 0.35,
                    transform: theme === t ? "scale(1.1)" : "scale(1)",
                  }}
                  title={THEMES[t].label}
                  aria-label={THEMES[t].label}
                >
                  {THEMES[t].icon}
                </button>
              ))}
              <div
                className="w-px h-4 mx-0.5"
                style={{ backgroundColor: cfg.fg, opacity: 0.15 }}
              />
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg transition-opacity opacity-50 hover:opacity-90 active:scale-90"
                style={{ color: cfg.fg }}
                aria-label={isFullscreen ? "Kichraytirish" : "To'liq ekran"}
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {!isBookReady && (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-5 px-4"
          >
            {book?.poster && (
              <div
                className="w-28 h-40 sm:w-32 sm:h-44 rounded-xl overflow-hidden"
                style={{ boxShadow: "0 24px 60px -12px rgba(0,0,0,0.35)" }}
              >
                <img
                  src={book.poster}
                  alt={book.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col items-center gap-3">
              <p
                className="text-sm font-medium"
                style={{ color: cfg.fg, opacity: 0.7 }}
              >
                Kitob yuklanmoqda…
              </p>
              <div
                className="w-44 h-1.5 rounded-full overflow-hidden"
                style={{
                  backgroundColor: theme === "dark" ? "#2a2a2e" : "#D0CCC8",
                }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: cfg.accent }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>
              <p
                className="text-xs font-mono"
                style={{ color: cfg.fg, opacity: 0.4 }}
              >
                {loadingProgress}%
              </p>
            </div>
          </motion.div>
        )}

        {isBookReady && (
          <motion.div
            key="flipbook"
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: zoom }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{
              transformOrigin: "center center",
              position: "relative",
            }}
          >
            <div
              className="absolute -inset-6 rounded-3xl pointer-events-none"
              style={{
                boxShadow:
                  theme === "dark"
                    ? "0 50px 120px -20px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)"
                    : "0 50px 120px -20px rgba(0,0,0,0.22), 0 20px 40px -10px rgba(0,0,0,0.1)",
              }}
            />
            <div
              className="absolute top-0 bottom-0 z-10 pointer-events-none"
              style={{
                left: isMobile ? undefined : "50%",
                width: isMobile ? 0 : "2px",
                transform: isMobile ? undefined : "translateX(-50%)",
                background:
                  theme === "dark"
                    ? "linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)"
                    : "linear-gradient(to right, transparent, rgba(0,0,0,0.1), transparent)",
              }}
            />

            {/* @ts-ignore */}
            <HTMLFlipBook
              ref={flipBookRef}
              width={bookWidth}
              height={bookHeight}
              size="fixed"
              minWidth={180}
              maxWidth={600}
              minHeight={250}
              maxHeight={900}
              showCover={true}
              mobileScrollSupport={true}
              onFlip={onFlip}
              className="shadow-none"
              style={{}}
              startPage={0}
              drawShadow={true}
              flippingTime={550}
              usePortrait={isMobile}
              startZIndex={1}
              autoSize={false}
              maxShadowOpacity={0.4}
              showPageCorners={true}
              disableFlipByClick={false}
              useMouseEvents={true}
              swipeDistance={40}
              clickEventForward={true}
            >
              {virtualPages.map((img, i) => (
                <Page
                  key={i}
                  pageImage={img}
                  pageNum={i + 1}
                  totalPages={totalPages}
                  theme={theme}
                />
              ))}
            </HTMLFlipBook>
          </motion.div>
        )}

        <AnimatePresence>
          {showControls && isBookReady && (
            <>
              <motion.button
                key="prev-btn"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                disabled={currentPage === 0}
                aria-label="Oldingi sahifa"
                className="absolute left-2 sm:left-5 p-2 sm:p-3 rounded-full backdrop-blur-sm transition-transform disabled:pointer-events-none disabled:opacity-15 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor:
                    theme === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.07)",
                  color: cfg.fg,
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>

              <motion.button
                key="next-btn"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                disabled={currentPage >= totalPages - 1}
                aria-label="Keyingi sahifa"
                className="absolute right-2 sm:right-5 p-2 sm:p-3 rounded-full backdrop-blur-sm transition-transform disabled:pointer-events-none disabled:opacity-15 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor:
                    theme === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.07)",
                  color: cfg.fg,
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showControls && isBookReady && (
          <motion.div
            key="bottom-bar"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-0 left-0 right-0 z-50 pt-8 pb-3 sm:pb-4 px-3 sm:px-6 flex items-end"
            style={{
              background: `linear-gradient(to top, ${cfg.overlay}, transparent)`,
            }}
          >
            <div className="flex-1 flex flex-col items-center gap-1.5 max-w-xs sm:max-w-md mx-auto">
              <div
                className="w-full h-1 rounded-full overflow-hidden"
                style={{
                  backgroundColor: theme === "dark" ? "#2a2a2e" : "#D0CCC8",
                }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progressPct}%`,
                    backgroundColor: cfg.accent,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <p
                className="text-[11px] font-mono tracking-widest"
                style={{ color: cfg.fg, opacity: 0.45 }}
              >
                {currentPage + 1} / {totalPages} sahifa
              </p>
            </div>

            <div className="absolute right-3 sm:right-5 bottom-3 sm:bottom-4 flex items-center gap-1">
              <button
                onClick={() =>
                  setZoom((z) => parseFloat(Math.max(0.5, z - 0.1).toFixed(1)))
                }
                className="p-1.5 rounded-md transition-opacity opacity-45 hover:opacity-90 active:scale-90"
                style={{ color: cfg.fg }}
                aria-label="Kichraytirish"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span
                className="text-[10px] font-mono w-9 text-center"
                style={{ color: cfg.fg, opacity: 0.4 }}
              >
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() =>
                  setZoom((z) => parseFloat(Math.min(1.6, z + 0.1).toFixed(1)))
                }
                className="p-1.5 rounded-md transition-opacity opacity-45 hover:opacity-90 active:scale-90"
                style={{ color: cfg.fg }}
                aria-label="Kattalashtirish"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookReader;
