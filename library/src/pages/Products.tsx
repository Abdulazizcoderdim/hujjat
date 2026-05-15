import BookCard from "@/components/BookCard";
import ProfileAvatar from "@/components/ProfileAvatar";
import SidebarNav from "@/components/SidebarNav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useDebounce from "@/hooks/useDebounce";
import $api from "@/http/axios";
import { isEduConfigured } from "@/http/edusystem";
import { ICategory, IProduct } from "@/interface";
import {
  fetchCurriculums,
  fetchSemesters,
  fetchSubjects,
} from "@/service/edusystem";
import { authStore } from "@/store/auth.store";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  GraduationCap,
  Loader,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface ResCategory {
  items: ICategory[];
}
interface ResProducts {
  items: IProduct<ICategory>[];
}

const ALL = "all";

const Products = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { user } = authStore();

  const search = params.get("q") ?? "";
  const activeCategory = params.get("category") ?? ALL;
  const curriculumId = params.get("curriculumId") ?? "";
  const semester = params.get("semester") ?? "";
  const subjectId = params.get("subjectId") ?? "";
  const onlyCurriculum = params.get("isCurriculumBook") === "true";

  const debouncedSearch = useDebounce(search, 400);
  const isSearching = debouncedSearch.trim().length > 0;
  const hasActiveCurriculumFilter =
    !!curriculumId || !!semester || !!subjectId || onlyCurriculum;

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null || value === "" || value === ALL) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setParams(next, { replace: true });
  };

  const clearCurriculumFilters = () => {
    const next = new URLSearchParams(params);
    next.delete("curriculumId");
    next.delete("semester");
    next.delete("subjectId");
    next.delete("isCurriculumBook");
    setParams(next, { replace: true });
  };

  const applyMyBooks = () => {
    const next = new URLSearchParams(params);
    next.set("isCurriculumBook", "true");
    if (user?.curriculumId) next.set("curriculumId", String(user.curriculumId));
    const sem = user?.semester ? parseInt(user.semester, 10) : NaN;
    if (!isNaN(sem)) next.set("semester", String(sem));
    setParams(next, { replace: true });
  };

  const { data: categories, isLoading: isLoadingCategories } =
    useQuery<ResCategory>({
      queryKey: ["categories"],
      queryFn: async () => {
        const { data } = await $api.get("/categories");
        return data;
      },
    });

  const curriculumsQ = useQuery({
    queryKey: ["edu", "curriculums"],
    queryFn: fetchCurriculums,
    enabled: isEduConfigured,
    staleTime: 5 * 60 * 1000,
  });
  const subjectsQ = useQuery({
    queryKey: ["edu", "subjects"],
    queryFn: () => fetchSubjects(true),
    enabled: isEduConfigured,
    staleTime: 5 * 60 * 1000,
  });
  const semestersQ = useQuery({
    queryKey: ["edu", "semesters"],
    queryFn: fetchSemesters,
    enabled: isEduConfigured,
    staleTime: 5 * 60 * 1000,
  });

  const productsQueryKey = useMemo(
    () => [
      "products",
      {
        category: activeCategory,
        curriculumId,
        semester,
        subjectId,
        onlyCurriculum,
      },
    ],
    [activeCategory, curriculumId, semester, subjectId, onlyCurriculum],
  );

  const { data: products, isLoading } = useQuery<ResProducts>({
    queryKey: productsQueryKey,
    queryFn: async () => {
      const queryParams = new URLSearchParams({ status: "approved" });
      queryParams.set("limit", "60");
      if (activeCategory !== ALL) queryParams.set("category", activeCategory);
      if (curriculumId) queryParams.set("curriculumId", curriculumId);
      if (semester) queryParams.set("semester", semester);
      if (subjectId) queryParams.set("subjectId", subjectId);
      if (onlyCurriculum) queryParams.set("isCurriculumBook", "true");

      const { data } = await $api.get(`/products?${queryParams.toString()}`);
      return data;
    },
  });

  const { data: searchResults = [], isFetching: isSearchFetching } = useQuery<
    IProduct<ICategory>[]
  >({
    queryKey: ["books-search", debouncedSearch],
    queryFn: async () => {
      const { data } = await $api.get("/products/books/search", {
        params: { q: debouncedSearch },
      });
      return data;
    },
    enabled: isSearching,
  });

  const displayedBooks = isSearching
    ? searchResults
    : (products?.items ?? []);

  if (isLoading || isLoadingCategories)
    return (
      <div className="h-svh w-full flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
      <SidebarNav />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-border bg-card/50 backdrop-blur-md">
          <div className="flex items-center gap-2 pl-12 md:pl-0">
            <button
              onClick={() => navigate("/")}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <ArrowLeft
                className="w-4 h-4 text-muted-foreground"
                strokeWidth={1.5}
              />
            </button>
            <span className="text-xs text-muted-foreground">
              Barcha kitoblar
            </span>
          </div>

          <ProfileAvatar />
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-lg sm:text-2xl font-semibold font-display mb-1">
              Barcha kitoblar
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-5">
              Kutubxonadagi barcha mavjud kitoblar — {displayedBooks.length} ta
              kitob
            </p>

            {/* Search */}
            <div className="relative mb-4">
              {isSearchFetching ? (
                <Loader2
                  className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-primary animate-spin"
                  strokeWidth={1.5}
                />
              ) : (
                <Search
                  className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground"
                  strokeWidth={1.5}
                />
              )}
              <input
                type="text"
                value={search}
                onChange={(e) => setParam("q", e.target.value)}
                placeholder="Kitob nomi yoki muallif..."
                className="w-full h-10 sm:h-11 bg-card border border-border rounded-xl text-sm pl-10 pr-4 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none placeholder:text-muted-foreground/60"
              />

              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setParam("q", null)}
                    className="absolute right-3 sm:right-4 top-3 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-secondary hover:bg-border transition-colors"
                  >
                    <X
                      className="w-3.5 h-3.5 text-muted-foreground"
                      strokeWidth={2}
                    />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Curriculum filters */}
            {isEduConfigured && (
              <div className="mb-4 rounded-xl border border-border bg-card/40 p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    O'quv reja bo'yicha filter
                  </div>
                  <div className="flex items-center gap-2">
                    {(user?.curriculumId || user?.semester) && (
                      <button
                        type="button"
                        onClick={applyMyBooks}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Mening kitoblarim
                      </button>
                    )}
                    {hasActiveCurriculumFilter && (
                      <button
                        type="button"
                        onClick={clearCurriculumFilters}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Tozalash
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <Select
                    value={curriculumId || ALL}
                    onValueChange={(v) =>
                      setParam("curriculumId", v === ALL ? null : v)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="O'quv reja" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>Barcha o'quv rejalar</SelectItem>
                      {curriculumsQ.data?.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={semester || ALL}
                    onValueChange={(v) =>
                      setParam("semester", v === ALL ? null : v)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Semestr" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>Barcha semestrlar</SelectItem>
                      {semestersQ.data?.map((s) => (
                        <SelectItem
                          key={s.id}
                          value={String(s.value ?? s.id)}
                        >
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={subjectId || ALL}
                    onValueChange={(v) =>
                      setParam("subjectId", v === ALL ? null : v)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Fan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>Barcha fanlar</SelectItem>
                      {subjectsQ.data?.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyCurriculum}
                    onChange={(e) =>
                      setParam(
                        "isCurriculumBook",
                        e.target.checked ? "true" : null,
                      )
                    }
                    className="rounded border-border"
                  />
                  Faqat o'quv reja kitoblari
                </label>
              </div>
            )}

            {/* Category filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 sm:mb-6 pb-1">
              <button
                key="all-cat"
                onClick={() => setParam("category", null)}
                className={`flex-shrink-0 px-3 sm:px-4 py-1.5 flex items-center gap-2 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  activeCategory === ALL
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Barchasi</span>
              </button>
              {categories?.items?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setParam("category", String(cat.id))}
                  className={`flex-shrink-0 px-3 sm:px-4 py-1.5 flex items-center gap-2 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    activeCategory === String(cat.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Books grid */}
            {displayedBooks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
                <AnimatePresence>
                  {displayedBooks.map((book, i) => (
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
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                {hasActiveCurriculumFilter ? (
                  <>
                    <GraduationCap
                      className="w-10 h-10 text-muted-foreground/40 mb-3"
                      strokeWidth={1.5}
                    />
                    <p className="text-sm text-muted-foreground">
                      Bu filter bo'yicha kitob topilmadi
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Filtrlarni o'zgartiring yoki tozalang
                    </p>
                    <button
                      onClick={clearCurriculumFilters}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/80 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Filterlarni tozalash
                    </button>
                  </>
                ) : (
                  <>
                    <Search
                      className="w-10 h-10 text-muted-foreground/40 mb-3"
                      strokeWidth={1.5}
                    />
                    <p className="text-sm text-muted-foreground">
                      Hech narsa topilmadi
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Boshqa kalit so'z bilan qidirib ko'ring
                    </p>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Products;
