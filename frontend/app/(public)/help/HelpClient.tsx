"use client";

import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  Download,
  FileText,
  HelpCircle,
  Mail,
  Phone,
  Search,
  Send,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";

// Tiplarni aniqlab olamiz
interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqCategories = [
  { id: "general", name: "Umumiy savollar", icon: HelpCircle },
  { id: "documents", name: "Hujjatlar", icon: FileText },
  { id: "payment", name: "To'lov", icon: CreditCard },
  { id: "download", name: "Yuklab olish", icon: Download },
  { id: "account", name: "Hisob", icon: User },
  { id: "security", name: "Xavfsizlik", icon: Shield },
];

const faqs: FAQ[] = [
  {
    id: "1",
    category: "general",
    question: "Doclab nima?",
    answer:
      "Doclab - bu sifatli va ishonchli hujjatlarni tez va oson topish uchun yaratilgan onlayn platforma. Bu yerda siz turli sohalarga oid hujjatlarni sotib olishingiz va yuklab olishingiz mumkin.",
  },
  {
    id: "2",
    category: "general",
    question: "Platformadan qanday foydalanish mumkin?",
    answer:
      "Ro'yxatdan o'ting, kerakli hujjatni toping, to'lovni amalga oshiring va hujjatni yuklab oling. Jarayon juda oddiy va tez!",
  },
  {
    id: "3",
    category: "documents",
    question: "Hujjatlar qanday formatda bo'ladi?",
    answer:
      "Hujjatlar PDF, DOCX, PPTX va boshqa mashhur formatlarda taqdim etiladi. Har bir hujjat sahifasida format ko'rsatilgan.",
  },
  {
    id: "4",
    category: "documents",
    question: "Hujjatlarni tahrirlash mumkinmi?",
    answer:
      "Ha, DOCX va PPTX formatidagi hujjatlarni o'zingizning ehtiyojlaringizga moslab tahrirlashingiz mumkin.",
  },
  {
    id: "5",
    category: "payment",
    question: "Qanday to'lov usullari mavjud?",
    answer:
      "Payme, Click, Uzcard va Humo kartalari orqali to'lov qilishingiz mumkin. Barcha to'lovlar xavfsiz va himoyalangan.",
  },
  {
    id: "6",
    category: "payment",
    question: "Pulni qaytarib olish mumkinmi?",
    answer:
      "Ha, agar hujjat tavsifga mos kelmasa, 24 soat ichida pulni qaytarib olish uchun murojaat qilishingiz mumkin.",
  },
  {
    id: "7",
    category: "download",
    question: "Yuklab olish limiti bormi?",
    answer:
      "Sotib olingan hujjatlarni cheksiz marta yuklab olishingiz mumkin. Yuklab olish havolasi hisobingizda saqlanadi.",
  },
  {
    id: "8",
    category: "download",
    question: "Yuklab olish muammosi bo'lsa nima qilish kerak?",
    answer:
      "Internetga ulanishingizni tekshiring. Muammo davom etsa, qo'llab-quvvatlash xizmatiga murojaat qiling.",
  },
  {
    id: "9",
    category: "account",
    question: "Parolni qanday o'zgartirish mumkin?",
    answer:
      "Profil sahifasida 'Sozlamalar' bo'limiga o'ting va 'Parolni o'zgartirish' tugmasini bosing.",
  },
  {
    id: "10",
    category: "account",
    question: "Telegram orqali qanday kirish mumkin?",
    answer:
      "Kirish sahifasida 'Telegram orqali kirish' tugmasini bosing, @Doclabuzbot botidan kod oling va tasdiqlang.",
  },
  {
    id: "11",
    category: "security",
    question: "Ma'lumotlarim xavfsizmi?",
    answer:
      "Ha, barcha ma'lumotlar shifrlangan va xavfsiz serverlarda saqlanadi. Biz sizning maxfiyligingizni hurmat qilamiz.",
  },
];

export default function HelpClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="flex-1">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Yordam markazi
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Savollaringizga javob toping yoki biz bilan bog'laning
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Savolni qidirish..."
              className="pl-12 h-14 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-border/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              Hammasi
            </button>
            {faqCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className="bg-card rounded-xl border border-border/50 overflow-hidden animate-fade-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <button
                    onClick={() =>
                      setOpenFaq(openFaq === faq.id ? null : faq.id)
                    }
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium text-foreground pr-4">
                      {faq.question}
                    </span>
                    {openFaq === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === faq.id && (
                    <div className="px-5 pb-5 text-muted-foreground animate-fade-up">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                Natija topilmadi
              </h3>
              <p className="text-muted-foreground">
                Boshqa kalit so'zlar bilan qidirib ko'ring
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
              Javob topa olmadingizmi?
            </h2>
            <p className="text-muted-foreground">
              Biz bilan bog'laning, sizga yordam beramiz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <a
              href="https://t.me/Doclab_support"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card rounded-xl border border-border/50 p-6 text-center hover:shadow-elegant transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-full bg-[#0088cc]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Send className="w-7 h-7 text-[#0088cc]" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">
                Telegram
              </h3>
              <p className="text-sm text-muted-foreground">@Doclab_support</p>
            </a>

            <a
              href="mailto:doclab.uz@gmail.com"
              className="bg-card rounded-xl border border-border/50 p-6 text-center hover:shadow-elegant transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">
                Email
              </h3>
              <p className="text-sm text-muted-foreground">
                doclab.uz@gmail.com
              </p>
            </a>

            <a
              href="tel:+998901234567"
              className="bg-card rounded-xl border border-border/50 p-6 text-center hover:shadow-elegant transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">
                Telefon
              </h3>
              <p className="text-sm text-muted-foreground">+998 97 706 11 24</p>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
