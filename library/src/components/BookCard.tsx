import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  cover: string;
  index: number;
}

const BookCard = ({ id, title, author, cover, index }: BookCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group flex-shrink-0 w-36 sm:w-44 cursor-pointer"
      onClick={() => navigate(`/book/${id}`)}
    >
      <div className="relative h-48 sm:h-60 w-full rounded-xl overflow-hidden shadow-card bg-secondary transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-search active:scale-[0.98]">
        <img
          src={cover}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button className="w-full py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
            O'qish
          </button>
        </div>
      </div>
      <div className="mt-3 px-1">
        <h4 className="text-xs sm:text-sm font-semibold text-foreground leading-tight truncate">{title}</h4>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{author}</p>
      </div>
    </motion.div>
  );
};

export default BookCard;
