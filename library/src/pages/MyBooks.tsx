import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SidebarNav from "@/components/SidebarNav";
import { User } from "lucide-react";
import { allBooks } from "@/data/books";

const myBooks = allBooks.slice(0, 4).map((b, i) => ({
  ...b,
  progress: [72, 45, 90, 30][i],
}));

const MyBooks = () => {
  const navigate = useNavigate();

  return (
    <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
      <SidebarNav activePage="mybooks" />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-border bg-card/50 backdrop-blur-md">
          <div className="text-xs text-muted-foreground pl-12 md:pl-0">Mening kitoblarim</div>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-8 min-h-0 overflow-y-auto">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl font-semibold font-display tracking-tight mb-6"
          >
            Mening kitoblarim
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {myBooks.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => navigate(`/book/${book.id}`)}
                className="bg-card rounded-xl border border-border p-4 flex gap-4 items-start cursor-pointer hover:shadow-card transition-shadow"
              >
                <img src={book.cover} alt={book.title} className="w-14 sm:w-16 h-20 sm:h-24 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate">{book.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{book.author}</p>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${book.progress}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{book.progress}% o'qilgan</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyBooks;
