import Header from "@/components/Header";
import SidebarNav from "@/components/SidebarNav";
import { StarRating } from "@/components/StarRating";
import $api from "@/http/axios";
import { ICategory, IProduct } from "@/interface";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TopRatedResponse {
  items: IProduct<ICategory>[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

const TopRatedPage = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery<TopRatedResponse>({
    queryKey: ["top-rated"],
    queryFn: async () => {
      const { data } = await $api.get("/products/top-rated", {
        params: { minReviews: 3, page: 1, limit: 60 },
      });
      return data;
    },
  });

  const items = data?.items ?? [];

  return (
    <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
      <SidebarNav activePage="top-rated" />
      <main className="flex-1 flex flex-col min-w-0">
        <Header title="Eng yuqori reyting" />

        <div className="flex-1 p-4 sm:p-8 min-h-0 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-xl sm:text-2xl font-semibold font-display tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              Eng yuqori reytingli kitoblar
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Kamida 3 ta sharh olgan kitoblar, o'rtacha ball bo'yicha
              tartiblangan.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <p className="text-sm">Yuklashda xato yuz berdi</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-primary text-sm underline"
              >
                Qayta urinish
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Hozircha 3 dan ortiq sharh olgan kitob yo'q.</p>
              <p className="text-xs mt-2">
                Birinchi bo'lib o'qigan kitoblaringizga sharh yozing!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {items.map((book, idx) => (
                <motion.button
                  key={book.id}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                  className="group relative w-full text-left cursor-pointer"
                  onClick={() => navigate(`/book/${book.id}`)}
                  aria-label={`${book.name} — ${Number(book.averageRating ?? 0).toFixed(1)} yulduz`}
                >
                  {idx < 3 && (
                    <div
                      className={`absolute -top-1.5 -left-1.5 z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-lg ${
                        idx === 0
                          ? "bg-amber-400 text-amber-950"
                          : idx === 1
                            ? "bg-zinc-300 text-zinc-800"
                            : "bg-orange-400 text-orange-950"
                      }`}
                    >
                      {idx + 1}
                    </div>
                  )}
                  <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-card bg-secondary transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-search">
                    {book.poster ? (
                      <img
                        src={book.poster}
                        alt={book.name}
                        loading="lazy"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs p-2 text-center">
                        {book.name}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 px-0.5">
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground leading-tight truncate">
                      {book.name}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                      {book.author || "—"}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <StarRating
                        value={Number(book.averageRating ?? 0)}
                        size="sm"
                      />
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {Number(book.averageRating ?? 0).toFixed(1)} (
                        {book.reviewsCount})
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TopRatedPage;
