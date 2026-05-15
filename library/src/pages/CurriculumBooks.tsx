import BookCard from "@/components/BookCard";
import Header from "@/components/Header";
import SidebarNav from "@/components/SidebarNav";
import $api from "@/http/axios";
import { ICategory, IProduct } from "@/interface";
import { fetchStudentLibraryContext } from "@/service/edusystem";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  GraduationCap,
  LogIn,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductsResp {
  items: IProduct<ICategory>[];
}

const CurriculumBooks = () => {
  const navigate = useNavigate();

  const ctxQ = useQuery({
    queryKey: ["student", "library-context"],
    queryFn: fetchStudentLibraryContext,
    retry: 1,
  });

  const booksQ = useQuery<ProductsResp>({
    queryKey: [
      "products",
      "curriculum",
      ctxQ.data?.curriculumId,
      ctxQ.data?.currentSemester,
    ],
    queryFn: async () => {
      const { data } = await $api.get("/products", {
        params: {
          status: "approved",
          curriculumId: ctxQ.data!.curriculumId,
          semester: ctxQ.data!.currentSemester,
          isCurriculumBook: true,
          limit: 100,
        },
      });
      return data;
    },
    enabled: !!ctxQ.data?.curriculumId && !!ctxQ.data?.currentSemester,
  });

  const ctx = ctxQ.data;
  const books = booksQ.data?.items ?? [];
  const isLoading = ctxQ.isLoading || booksQ.isLoading;

  return (
    <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
      <SidebarNav activePage="curriculum" />

      <main className="flex-1 flex flex-col min-w-0">
        <Header title="Mening o'quv reja kitoblarim" />

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {/* Loading */}
          {isLoading && (
            <div className="space-y-4">
              <div className="h-32 rounded-2xl bg-card/50 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-xl bg-card/50 animate-pulse"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Context xato — auth muammosi */}
          {!isLoading && ctxQ.error && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto mt-12 text-center"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
                <AlertCircle className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                O'quv reja ma'lumotini olib bo'lmadi
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {(ctxQ.error as any)?.message ||
                  "HEMIS bilan bog'lanishda xato. Tizimga qaytadan kiring."}
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => ctxQ.refetch()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Qaytadan urinib ko'rish
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("hemis_token");
                    navigate("/login");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Qaytadan login
                </button>
              </div>
            </motion.div>
          )}

          {/* Context yuklandi */}
          {!isLoading && ctx && (
            <>
              {/* Student info banner */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 p-5 sm:p-6 mb-6"
              >
                <div className="absolute inset-0 -z-10 opacity-30">
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-400/20 rounded-full blur-3xl" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary shrink-0">
                    <GraduationCap
                      className="w-6 h-6 sm:w-7 sm:h-7"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
                      O'quv reja
                    </p>
                    <h2 className="text-base sm:text-lg font-semibold truncate">
                      {ctx.curriculumName}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        Joriy semestr:{" "}
                        <span className="font-semibold text-foreground">
                          {ctx.currentSemester}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" />
                        Fanlar:{" "}
                        <span className="font-semibold text-foreground">
                          {ctx.subjectIds?.length ?? 0}
                        </span>
                      </span>
                      <span>•</span>
                      <span className="font-medium text-foreground">
                        {books.length} ta kitob
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Books grid yoki empty state */}
              {books.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-4">
                    <BookOpen className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-medium mb-1.5">
                    Hozircha kitob topilmadi
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Bu o'quv reja va semestrga biriktirilgan kitoblar
                    kutubxonaga hali qo'shilmagan.
                  </p>
                  <button
                    onClick={() => navigate("/products")}
                    className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
                  >
                    Barcha kitoblarni ko'rish
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-baseline justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold">
                      Sizning kitoblaringiz
                    </h3>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {books.length} ta
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
                    <AnimatePresence>
                      {books.map((book, i) => (
                        <BookCard
                          key={book.id}
                          id={book.id}
                          title={book.name}
                          author={book.author}
                          cover={book.poster}
                          index={i}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CurriculumBooks;
