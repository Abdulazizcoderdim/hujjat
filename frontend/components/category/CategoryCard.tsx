import { ICategory } from "@/interface";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CategoryCardProps {
  category: ICategory;
  className?: string;
}

export const CategoryCard = ({ category, className }: CategoryCardProps) => {
  return (
    <Link
      href={`/category/${category.slug}`}
      className={cn(
        "group block sm:p-6 p-3 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 card-hover",
        className,
      )}
    >
      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        {category.icon}
      </div>

      <h3 className="font-display font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
        {category.name}
      </h3>

      <p className="text-sm text-muted-foreground">
        {category.productsCount} ta hujjat
      </p>
    </Link>
  );
};
