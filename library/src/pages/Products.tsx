import BookCard from "@/components/BookCard";
import SidebarNav from "@/components/SidebarNav";
import useDebounce from "@/hooks/useDebounce";
import $api from "@/http/axios";
import { ICategory, IProduct } from "@/interface";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader, Loader2, Search, User, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ResCategory {
  items: ICategory[];
}
interface ResProducts {
  items: IProduct<ICategory>[];
}

const Products = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Barchasi");
  const debouncedSearch = useDebounce(search, 400);

  const isSearching = debouncedSearch.trim().length > 0;

  const { data: categories, isLoading: isLoadingCategories } =
    useQuery<ResCategory>({
      queryKey: ["categories"],
      queryFn: async () => {
        const { data } = await $api.get("/categories");
        return data;
      },
    });

  const { data: products, isLoading } = useQuery<ResProducts>({
    queryKey: ["products", activeCategory],
    queryFn: async () => {
      if (activeCategory === "Barchasi") {
        const { data } = await $api.get(`/products?status=approved`);
        return data;
      }

      const { data } = await $api.get(
        `/products?category=${activeCategory}&status=approved`,
      );
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

  const displayedBooks = isSearching ? searchResults : products?.items;

  if (isLoading || isLoadingCategories) return <Loader />;

  return (
    <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
      <SidebarNav />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-border bg-card/50 backdrop-blur-md">
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
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Talaba
            </span>
            <div
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center cursor-pointer"
              onClick={() => navigate("/profile")}
            >
              <User
                className="w-4 h-4 text-muted-foreground"
                strokeWidth={1.5}
              />
            </div>
          </div>
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
              Kutubxonadagi barcha mavjud kitoblar — {products.items.length} ta
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
                onChange={(e) => setSearch(e.target.value)}
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
                    onClick={() => setSearch("")}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-secondary hover:bg-border transition-colors"
                  >
                    <X
                      className="w-3.5 h-3.5 text-muted-foreground"
                      strokeWidth={2}
                    />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Category filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 sm:mb-6 pb-1">
              {categories?.items?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 px-3 sm:px-4 py-1.5 flex items-center gap-2 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Books grid */}
            {displayedBooks?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
                <AnimatePresence>
                  {displayedBooks?.map((book, i) => (
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
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Products;
