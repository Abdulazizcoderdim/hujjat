import { Star } from "lucide-react";
import { useState, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  /** 0–5 (yarim qiymat ham qabul qilinadi display rejimida, masalan 4.3) */
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (value: number) => void;
  /** Display rejimda yonida (12) kabi soni ko'rsatish uchun */
  showValue?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { w: "w-3 h-3", text: "text-xs" },
  md: { w: "w-5 h-5", text: "text-sm" },
  lg: { w: "w-7 h-7", text: "text-lg" },
};

export function StarRating({
  value,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
  className,
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const cls = SIZE_MAP[size];
  const display = hover ?? value;

  const stars = Array.from({ length: max }, (_, i) => {
    const star = i + 1;
    let fillPct = 0;
    if (display >= star) fillPct = 100;
    else if (display > star - 1) fillPct = (display - (star - 1)) * 100;
    return { star, fillPct };
  });

  const set = (n: number) => {
    if (!interactive || !onChange) return;
    onChange(n);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive || !onChange) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(max, Math.round(value) + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(0, Math.round(value) - 1));
    } else if (e.key >= "1" && e.key <= "9") {
      const n = parseInt(e.key, 10);
      if (n <= max) onChange(n);
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1",
        interactive && "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded",
        className,
      )}
      role={interactive ? "radiogroup" : "img"}
      aria-label={`${value.toFixed(1)} / ${max} yulduz`}
      tabIndex={interactive ? 0 : -1}
      onKeyDown={onKeyDown}
      onMouseLeave={() => setHover(null)}
    >
      {stars.map(({ star, fillPct }) => (
        <span
          key={star}
          className="relative inline-block"
          onMouseEnter={() => interactive && setHover(star)}
          onClick={(e) => {
            e.preventDefault();
            set(star);
          }}
          role={interactive ? "radio" : undefined}
          aria-checked={interactive ? Math.round(value) === star : undefined}
          aria-label={interactive ? `${star} yulduz` : undefined}
        >
          {/* Bo'sh yulduz (kontur) */}
          <Star
            className={cn(cls.w, "text-amber-400/40")}
            strokeWidth={1.5}
          />
          {/* To'ldirilgan yulduz — fillPct% kenglikda kesilgan */}
          <span
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ width: `${fillPct}%` }}
          >
            <Star
              className={cn(cls.w, "text-amber-500 fill-amber-500")}
              strokeWidth={1.5}
            />
          </span>
        </span>
      ))}
      {showValue && (
        <span className={cn("ml-1 font-semibold", cls.text)}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default StarRating;
