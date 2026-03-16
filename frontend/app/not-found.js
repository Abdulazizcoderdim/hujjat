import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center space-y-4 justify-center h-screen">
      <h2 className="text-2xl font-bold">Sahifa topilmadi! 404</h2>
      <p>Afsuski, siz qidirayotgan sahifa mavjud emas.</p>

      <Button variant="outline" asChild>
        <Link href="/">Bosh sahifaga qaytish</Link>
      </Button>
    </div>
  );
}
