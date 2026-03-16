"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Download, FileText, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

export const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    userCount: 0,
    downloadCount: 0,
    productCount: 0,
  });
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL + "/users/public-stat")
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/30 py-16 lg:py-24">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container-main relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary sm:text-sm text-xs font-medium mb-6 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            O&apos;zbekistonning eng yirik hujjat bozori
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-up stagger-1">
            Kerakli hujjatlarni{" "}
            <span className="text-primary">tez va oson</span> toping
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-up stagger-2">
            Yuqori sifatli va ishonchli hujjatlarga kirish imkoniyatini oling.
            Biznes rejalardan tortib shartnomalar va ta&apos;lim
            materiallarigacha.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-12 animate-fade-up stagger-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Qanday hujjat qidiryapsiz?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-12 h-14 text-base bg-card shadow-sm border-border"
              />
            </div>
            <Button
              size="xl"
              variant="hero"
              className="group"
              onClick={handleSearch}
            >
              Qidirish
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-up stagger-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <div className="font-display font-bold sm:text-2xl text-foreground">
                {formatNumber(stats.productCount)}+
              </div>
              <div className="sm:text-sm text-xs text-muted-foreground">
                Hujjatlar
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
                <Users className="w-6 h-6" />
              </div>
              <div className="font-display font-bold sm:text-2xl text-foreground">
                {formatNumber(stats.userCount)}+
              </div>
              <div className="sm:text-sm text-xs text-muted-foreground">
                Foydalanuvchilar
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
                <Download className="w-6 h-6" />
              </div>
              <div className="font-display font-bold sm:text-2xl text-foreground">
                {formatNumber(stats.downloadCount)}+
              </div>
              <div className="sm:text-sm text-xs text-muted-foreground">
                Yuklab olishlar
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
