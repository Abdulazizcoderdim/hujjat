import { Search, User } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SidebarNav from "@/components/SidebarNav";
import BookCard from "@/components/BookCard";
import { allBooks } from "@/data/books";

const books = allBooks.slice(0, 6);
const recentBooks = allBooks.slice(6, 10);

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
      <SidebarNav />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-border bg-card/50 backdrop-blur-md">
          <div className="text-xs text-muted-foreground pl-12 md:pl-0">Bosh sahifa</div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">Talaba</span>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col px-4 sm:px-8 py-4 sm:py-6 min-h-0">
          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl mx-auto text-center mb-6 sm:mb-8 flex-shrink-0"
          >
            <p className="text-[10px] sm:text-xs text-primary font-semibold font-mono-label mb-2">
              Osiyo Texnologiyalar Universiteti Axborot Kutubxonasi
            </p>
            <h2 className="text-xl sm:text-3xl font-semibold tracking-tight font-display text-balance mb-4 sm:mb-5">
              Bilim chegarasiz. Bugun nima o'qiymiz?
            </h2>
            <div className="relative">
              <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Kitoblar, maqolalar yoki mualliflar..."
                className="w-full h-12 sm:h-14 bg-card border-2 border-border rounded-2xl text-sm sm:text-base focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-search placeholder:text-muted-foreground/60"
                style={{ paddingLeft: '2.75rem' }}
              />
              <kbd className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 h-6 sm:h-7 px-1.5 sm:px-2 bg-secondary border border-border rounded-md hidden sm:flex items-center text-[10px] text-muted-foreground font-mono-label">
                ⌘ K
              </kbd>
            </div>
          </motion.div>

          {/* Books Sections */}
          <div className="flex-1 flex flex-col min-h-0 gap-4 sm:gap-6">
            {/* Recommended */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0">
                <h3 className="font-semibold text-sm font-display">Tavsiya etilgan</h3>
                <button className="text-xs text-primary font-medium hover:underline">Hammasini ko'rish →</button>
              </div>
              <div className="flex gap-3 sm:gap-5 overflow-x-auto no-scrollbar pb-2 flex-1 min-h-0 items-start">
                {books.map((book, i) => (
                  <BookCard key={book.id} id={book.id} title={book.title} author={book.author} cover={book.cover} index={i} />
                ))}
              </div>
            </div>

            {/* Recently Read */}
            <div className="flex-shrink-0">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-sm font-display">So'nggi o'qilganlar</h3>
                <button className="text-xs text-primary font-medium hover:underline">Hammasini ko'rish →</button>
              </div>
              <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2">
                {recentBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => navigate(`/book/${book.id}`)}
                    className="flex-shrink-0 flex items-center gap-3 bg-card rounded-xl p-3 pr-5 sm:pr-6 border border-border shadow-soft hover:shadow-card transition-shadow cursor-pointer"
                  >
                    <img src={book.cover} alt={book.title} className="w-10 h-14 rounded-md object-cover" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{book.title}</p>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground">{book.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
