import BookCard from "@/components/BookCard";
import SidebarNav from "@/components/SidebarNav";
import { allBooks } from "@/data/books";
import { motion } from "framer-motion";
import { ArrowLeft, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
const facultyMap: Record<string, string> = {
  "axborot-texnologiyalari": "Axborot texnologiyalari",
  iqtisodiyot: "Iqtisodiyot",
  "gumanitar-fanlar": "Gumanitar fanlar",
  muhandislik: "Muhandislik",
};
const Faculty = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const facultyName = facultyMap[slug || ""] || "Fakultet";
  const filteredBooks = allBooks.filter((b) => b.category === facultyName);
  return (
    <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
      <SidebarNav activePage={slug || ""} />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-border bg-card/50 backdrop-blur-md">
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
            <span className="text-xs text-muted-foreground">{facultyName}</span>
          </div>
          <div className="flex items-center gap-3">
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
        <div className="flex-1 px-4 sm:px-8 py-4 sm:py-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight font-display mb-1">
              {facultyName}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {filteredBooks.length} ta kitob mavjud
            </p>
            {filteredBooks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
                {filteredBooks.map((book, i) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    cover={book.cover}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-sm">
                  Bu fakultet uchun kitoblar hali qo'shilmagan
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
