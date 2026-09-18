import $api from "@/http/axios";
import { BookOpen, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

/**
 * QR-kod "darvozasi" — kitobga yopishtirilgan QR shu sahifaga olib keladi.
 * 1) skanerlanganini backend'ga yozadi (fire-and-forget, auth talab qilmaydi)
 * 2) kitob sahifasiga yo'naltiradi; login bo'lmasa ProtectedRoute
 *    /login?returnTo=/book/:id ga olib boradi va login'dan keyin qaytaradi.
 */
const QrGate = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const valid = Number.isInteger(numericId) && numericId > 0;

  useEffect(() => {
    if (!valid) return;
    $api.post(`/products/${numericId}/qr-scan`).catch(() => {
      /* statistika — xato bo'lsa ham foydalanuvchini to'xtatmaymiz */
    });
  }, [numericId, valid]);

  if (!valid) return <Navigate to="/" replace />;

  return (
    <>
      <Navigate to={`/book/${numericId}`} replace />
      <div className="h-svh w-full flex flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
        <BookOpen className="w-8 h-8 opacity-40" />
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Kitob ochilmoqda…
        </div>
      </div>
    </>
  );
};

export default QrGate;
