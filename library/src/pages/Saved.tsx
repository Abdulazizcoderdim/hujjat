import Header from "@/components/Header";
import SidebarNav from "@/components/SidebarNav";
import $api from "@/http/axios";
import { ICategory, IProduct } from "@/interface";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Saved = () => {
  const navigate = useNavigate();
  const savedBooks = JSON.parse(localStorage.getItem("savedBooks") || "[]");

  const { data, isLoading } = useQuery<IProduct<ICategory>[]>({
    queryKey: ["savedBooks"],
    queryFn: async () => {
      const { data } = await $api.get("/products/books", {
        params: {
          ids: savedBooks.join(","),
        },
      });
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="h-svh w-full flex bg-background text-foreground items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">
            Saqlangan kitoblar yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
      <SidebarNav activePage="saved" />
      <main className="flex-1 flex flex-col min-w-0">
        <Header title="Saqlanganlar" />

        <div className="flex-1 p-4 sm:p-8 min-h-0 overflow-y-auto">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl font-semibold font-display tracking-tight mb-6"
          >
            Saqlanganlar
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {data?.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => navigate(`/book/${book.id}`)}
                className="bg-card rounded-xl border border-border p-4 flex gap-4 items-start cursor-pointer hover:shadow-card transition-shadow"
              >
                <img
                  src={book.poster}
                  alt={book.name}
                  className="w-14 sm:w-16 h-20 sm:h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate">
                    {book.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {book.author}
                  </p>
                  <Star className="w-4 h-4 text-primary fill-primary" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Saved;
