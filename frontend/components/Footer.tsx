import { Instagram, Mail, MapPin, Phone, Send } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { label: "Bosh sahifa", to: "/" },
  { label: "Kategoriyalar", to: "/categories" },
  { label: "Hujjatlar", to: "/products" },
  { label: "Profil", to: "/profile" },
];

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container-main py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-5">
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/footer.png" alt="Logo" className="h-10 w-auto" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Kerakli hujjatlarni tez va oson toping. Yuqori sifatli va
              ishonchli ma'lumotlarga kirish imkoniyatini oling.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Tezkor havolalar
            </h4>
            <ul className="space-y-3">
              {navLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    href={item.to}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Kategoriyalar
            </h4>
            <ul className="space-y-3">
              {[
                "Biznes rejalar",
                "Taqdimotlar",
                "Shartnomalar",
                "Shablonlar",
              ].map((cat) => (
                <li key={cat}>
                  <Link
                    href="/categories"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Aloqa
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4 text-primary" />
                doclab.uz@gmail.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="w-4 h-4 text-primary" />
                +998 97 706 11 24
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                Namangan, O'zbekiston
              </li>
            </ul>

            <div className="flex gap-3 mt-6">
              <a
                href="https://www.instagram.com/doclabuz/"
                target="_blank"
                className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors text-muted-foreground"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://t.me/doclabuz"
                target="_blank"
                className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors text-muted-foreground"
              >
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Doclab. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy-policy"
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Maxfiylik siyosati
            </Link>

            <Link
              href="/user-agreement"
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Foydalanish shartlari
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
