import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Calendar, FileText, Globe, Star, Tag, User } from "lucide-react";
import SidebarNav from "@/components/SidebarNav";
import BookCard from "@/components/BookCard";
import { getBookById, getRelatedBooks } from "@/data/books";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const book = getBookById(Number(id));

  if (!book) {
    return (
      <div className="h-svh w-full flex bg-background text-foreground items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Kitob topilmadi</p>
          <Link to="/" className="text-sm text-primary hover:underline">Bosh sahifaga qaytish</Link>
        </div>
      </div>
    );
  }

  const related = getRelatedBooks(book);

  const infoItems = [
    { icon: <Calendar className="w-4 h-4" strokeWidth={1.5} />, label: "Yil", value: book.year },
    { icon: <FileText className="w-4 h-4" strokeWidth={1.5} />, label: "Sahifalar", value: book.pages },
    { icon: <Globe className="w-4 h-4" strokeWidth={1.5} />, label: "Til", value: book.language },
    { icon: <Tag className="w-4 h-4" strokeWidth={1.5} />, label: "Kategoriya", value: book.category },
  ];

  return (
    <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
      <SidebarNav />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-border bg-card/50 backdrop-blur-md">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Orqaga</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-6 sm:gap-10 mb-10"
          >
            {/* Cover */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="w-48 h-72 sm:w-56 sm:h-80 rounded-2xl overflow-hidden shadow-search bg-secondary">
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="text-center sm:text-left">
                <p className="text-[10px] font-mono-label text-primary mb-1">{book.category}</p>
                <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight mb-2">{book.title}</h1>
                <p className="text-base text-muted-foreground mb-6">{book.author}</p>
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed mb-6">{book.description}</p>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {infoItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5 p-3 bg-secondary rounded-xl">
                    <span className="text-muted-foreground">{item.icon}</span>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-mono-label">{item.label}</p>
                      <p className="text-sm font-semibold">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <button className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                  O'qishni boshlash
                </button>
                <button className="h-12 px-6 bg-card border-2 border-border rounded-xl font-semibold text-sm text-foreground hover:bg-secondary active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <Star className="w-4 h-4" strokeWidth={1.5} />
                  Saqlash
                </button>
              </div>
            </div>
          </motion.div>

          {/* Related books */}
          {related.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm font-display mb-4">O'xshash kitoblar</h3>
              <div className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar pb-4">
                {related.map((b, i) => (
                  <BookCard key={b.id} id={b.id} title={b.title} author={b.author} cover={b.cover} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookDetail;
