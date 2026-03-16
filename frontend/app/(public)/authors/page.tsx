import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { FileText, Users } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

interface AuthorsResponse {
  stats: {
    totalSellers: number;
    totalProducts: number;
    totalDownloads: number;
  };
  topAuthors: {
    _id: string;
    full_name: string;
    avatar?: string;
    bio?: string;
    totalProducts: number;
    totalViews: number;
    totalSold: number;
  }[];
}

async function getAuthors(): Promise<AuthorsResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/authors`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok)
    return {
      stats: { totalSellers: 0, totalProducts: 0, totalDownloads: 0 },
      topAuthors: [],
    };
  return res.json();
}

export const metadata: Metadata = {
  title: "Sotuvchilar | DocLab",
  description: "DocLab sotuvchilar sahifasi.",
  alternates: {
    canonical: "/authors",
  },
  robots: {
    index: false,
    follow: false,
  },
};

const Authors = async () => {
  const data = await getAuthors();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Mualliflar
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Sifatli hujjatlar yaratuvchi professional mualliflarimiz bilan
              tanishing.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border/50">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-heading font-bold text-primary mb-1">
                  {data.stats.totalSellers.toLocaleString()}+
                </div>
                <div className="text-sm text-muted-foreground">Mualliflar</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-heading font-bold text-primary mb-1">
                  {data.stats.totalProducts.toLocaleString()}+
                </div>
                <div className="text-sm text-muted-foreground">Hujjatlar</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-heading font-bold text-primary mb-1">
                  {data.stats.totalDownloads.toLocaleString()}+
                </div>
                <div className="text-sm text-muted-foreground">
                  Yuklab olishlar
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authors Grid */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.topAuthors.map((author, index) => (
              <div
                key={index}
                className="bg-card rounded-xl border border-border/50 p-6 hover:shadow-elegant transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={
                      author.avatar ||
                      "https://e7.pngegg.com/pngimages/84/165/png-clipart-united-states-avatar-organization-information-user-avatar-service-computer-wallpaper-thumbnail.png"
                    }
                    alt={author.full_name}
                    loading="lazy"
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-foreground text-lg">
                      {author.full_name}
                    </h3>
                  </div>
                </div>

                {author.bio && (
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {author.bio}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm border-t border-border/50 pt-4">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>{author.totalProducts} hujjat</span>
                  </div>
                </div>

                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href={`/author/${author._id}`}>
                    Hujjatlarni ko'rish
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Become Author CTA */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
              Muallif bo'lishni xohlaysizmi?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              O'z bilimlaringizni ulashing va daromad qiling. Hujjatlaringizni
              platformamizda joylashtiring.
            </p>
            <Link href="https://sotuvchi.doclab.uz" target="_blank">
              <Button size="lg" className="gap-2">
                Ro'yxatdan o'tish
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Authors;
