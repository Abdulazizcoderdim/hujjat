import { CategoriesSection } from "@/components/category/CategoriesSection";
import { CTASection } from "@/components/CTASection";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DocLab - O'zbekistonning eng yirik hujjat bozori",
  description:
    "Kerakli hujjatlarni tez va oson toping. Biznes rejalar, shartnomalar va ta'lim materiallari.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return (
    <>
      <ScrollToTop />

      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          <HeroSection />
          {/* <PromoSlider /> */}
          <CategoriesSection />
          {/* <VideoSection /> */}

          <FeaturedProducts />
          {/* <PopularProducts />
          <BestNewProducts />
          <TaqdimotlarProducts />
          <KursIshlariProducts />
          <ReferatProducts />
          <DiplomProducts />
          <MustaqilProducts />
          <TestlarProducts /> */}
          <CTASection />
        </main>

        <Footer />
      </div>
    </>
  );
}
