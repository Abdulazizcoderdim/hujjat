import Link from "next/link";

const VideoSection = () => {
  return (
    <section className="pb-20 md:pb-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>▶ Video qo'llanma</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Platforma qanday ishlashini ko'ring
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Quyidagi videoda Doclab platformasidan foydalanish bo'yicha to'liq
            ko'rsatma berilgan.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_-10px_hsl(var(--primary)/0.25)] border border-border/50 bg-card">
            {/* Decorative top bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/60 border-b border-border/50">
              <div className="w-3 h-3 rounded-full bg-destructive/70" />
              <div className="w-3 h-3 rounded-full bg-accent/70" />
              <div className="w-3 h-3 rounded-full bg-secondary/70" />
              <div className="flex-1 mx-4">
                <div className="bg-background/80 rounded-md px-3 py-1 text-xs text-muted-foreground text-center max-w-lg mx-auto">
                  Doclab.uz qanday platforma?{" "}
                  <span className="max-sm:hidden">
                    Hujjatlarni topish va sotish imkoniyati
                  </span>
                </div>
              </div>
            </div>
            {/* 16:9 Aspect Ratio Video Wrapper */}
            <div
              className="relative w-full"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/hIXVDszxUWI?rel=0&modestbranding=1&color=white"
                title="doclab.uz — Platforma qo'llanmasi"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
          {/* Below video label */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Savollaringiz bormi?{" "}
            <Link
              href="/help"
              className="text-primary font-medium hover:underline"
            >
              Yordam bo'limiga o'ting →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
