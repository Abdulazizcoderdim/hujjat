import BookCard from "@/components/BookCard";
import ProfileAvatar from "@/components/ProfileAvatar";
import SidebarNav from "@/components/SidebarNav";
import $api from "@/http/axios";
import { ICategory, IProduct } from "@/interface";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const Faculty = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<IProduct<ICategory>[]>({
    queryKey: ["category", slug],
    queryFn: async () => {
      const res = await $api.get(`/categories/related-products/${slug}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
        <SidebarNav activePage={slug || ""} />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-border bg-card/50 backdrop-blur-md">
            <div className="flex items-center gap-3 pl-12 md:pl-0">
              <div className="w-8 h-8 rounded-lg bg-secondary/50 animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-card/50 animate-pulse" />
            </div>
          </header>

          <div className="flex-1 px-4 sm:px-8 py-4 sm:py-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="h-8 w-40 rounded-lg bg-card/50 animate-pulse" />
              <div className="h-4 w-32 rounded-lg bg-card/50 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-xl bg-card/50 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
        <SidebarNav activePage={slug || ""} />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-border bg-card/50 backdrop-blur-md">
            <div className="flex items-center gap-3 pl-12 md:pl-0">
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <ArrowLeft
                  className="w-4 h-4 text-foreground"
                  strokeWidth={1.5}
                />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <ProfileAvatar />
            </div>
          </header>

          <div className="flex-1 px-4 sm:px-8 py-4 sm:py-6 overflow-y-auto">
            <p>Kitoblar mavjud emas</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
      <SidebarNav activePage={slug || ""} />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-border bg-card/50 backdrop-blur-md">
          <div className="flex items-center gap-3 pl-0 sm:pl-12 md:pl-0">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft
                className="w-4 h-4 text-foreground"
                strokeWidth={1.5}
              />
            </button>
            <span className="text-xs text-muted-foreground">
              {data?.[0].category.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ProfileAvatar />
          </div>
        </header>

        <div className="flex-1 px-4 sm:px-8 py-4 sm:py-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight font-display mb-1">
              {data?.[0].category.name}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {data?.length} ta kitob mavjud
            </p>
            {data?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
                {data?.map((book, i) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    title={book.name}
                    author={book.author}
                    cover={book.poster}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-sm">
                  Bu kategoriya uchun kitoblar hali qo'shilmagan
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};
export default Faculty;
