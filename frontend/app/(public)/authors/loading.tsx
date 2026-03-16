import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 lg:py-12">
        <div className="container-main py-16 text-center text-muted-foreground">
          Mualliflar yuklanmoqda…
        </div>
      </main>

      <Footer />
    </div>
  );
}
