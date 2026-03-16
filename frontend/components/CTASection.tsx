import { Button } from "@/components/ui/button";
import { ArrowRight, FileUp } from "lucide-react";
import Link from "next/link";

export const CTASection = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container-main">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-5 sm:p-12 lg:p-16">
          {/* Background Decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-primary-foreground text-sm font-medium mb-4">
                <FileUp className="w-4 h-4" />
                Sotuvchi bo'ling
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
                O'z hujjatlaringizni soting
              </h2>
              <p className="text-primary-foreground/80 max-w-lg text-lg">
                Professional hujjatlaringizni platformamizga joylashtiring va
                daromad oling. Minglab foydalanuvchilarga yeting.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="https://sotuvchi.doclab.uz" target="_blank">
                <Button
                  size="xl"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg"
                >
                  Boshlash
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>

              <Link href="https://sotuvchi.doclab.uz" target="_blank">
                <Button
                  size="xl"
                  variant="ghost"
                  className="text-primary-foreground border-2 border-white/30 hover:bg-white/10"
                >
                  Batafsil
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
