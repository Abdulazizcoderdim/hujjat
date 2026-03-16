export interface PromoSlide {
  id: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  icon?: "youtube" | "telegram" | "sparkles" | "book" | "zap";
  thumbnail?: string;
}

export const promoSlides: PromoSlide[] = [
  {
    id: "1",
    badge: "YANGI",
    badgeVariant: "default",
    title: "Telegram kanalimizga qo'shiling",
    description:
      "Eng so'nggi yangiliklar va maxsus takliflardan xabardor bo'ling.",
    ctaText: "Telegram'ga o'tish",
    ctaUrl: "https://t.me/docmarket",
    icon: "telegram",
    thumbnail:
      "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=400&h=200&fit=crop",
  },
  {
    id: "2",
    badge: "VIDEO",
    badgeVariant: "secondary",
    title: "YouTube darsliklarimiz",
    description: "Hujjatlardan qanday foydalanishni o'rganing.",
    ctaText: "YouTube'da ko'rish",
    ctaUrl: "https://youtube.com/@docmarket",
    icon: "youtube",
    thumbnail:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=200&fit=crop",
  },
  {
    id: "3",
    badge: "YANGILIK",
    badgeVariant: "outline",
    title: "Yangi filtrlash tizimi",
    description: "Endi hujjatlarni tezroq va osonroq toping.",
    ctaText: "Sinab ko'ring",
    ctaUrl: "/search",
    icon: "sparkles",
  },
  {
    id: "4",
    badge: "QO'LLANMA",
    badgeVariant: "secondary",
    title: "Boshlash uchun qo'llanma",
    description: "DocMarket platformasidan qanday foydalanishni o'rganing.",
    ctaText: "O'qish",
    ctaUrl: "/help",
    icon: "book",
    thumbnail:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=200&fit=crop",
  },
  {
    id: "5",
    badge: "PREMIUM",
    badgeVariant: "default",
    title: "Premium a'zolik afzalliklari",
    description: "Cheksiz yuklab olish va maxsus hujjatlarga kirish.",
    ctaText: "Batafsil",
    ctaUrl: "/premium",
    icon: "zap",
  },
];
