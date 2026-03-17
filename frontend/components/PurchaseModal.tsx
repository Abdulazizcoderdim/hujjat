"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatPrice } from "@/hooks/formatPrice";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import type { ICategory, IProduct, IUser } from "@/interface";
import { cn } from "@/lib/utils";
import { CalendarDays, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PurchaseModalProps {
  product: IProduct<ICategory, IUser>;
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = "click" | "payme-site" | "payme" | "card";
type PaymeStep = "INITIAL" | "SMS_VERIFICATION";

export const PurchaseModal = ({
  product,
  isOpen,
  onClose,
}: PurchaseModalProps) => {
  const productReturnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/product/${product.slug || product.id}?payment=success`
      : `https://www.doclab.uz/product/${product.slug || product.id}?payment=success`;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("payme");
  const [loading, setLoading] = useState(false);

  const [paymeStep, setPaymeStep] = useState<PaymeStep>("INITIAL");
  const [cardNumber, setCardNumber] = useState("");
  const [expire, setExpire] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [paymeToken, setPaymeToken] = useState("");
  const [paymePhone, setPaymePhone] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  const [preview, setPreview] = useState<{
    productPrice: number;
    buyerCommission: number;
    totalAmount: number;
    buyerCommissionRate: number;
  } | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setPaymeStep("INITIAL");
      setCardNumber("");
      setExpire("");
      setSmsCode("");
      setPaymeToken("");
      setOrderId(null);
      return;
    }

    (async () => {
      try {
        const { data } = await $api.post("/orders/preview", {
          productId: product.id,
        });
        setPreview(data);
      } catch (error) {
        console.error("Preview yuklashda xatolik", error);
      }
    })();
  }, [isOpen, product.id]);

  if (!product) return null;

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    const formatted = val.match(/.{1,4}/g)?.join(" ") || "";
    setCardNumber(formatted.substring(0, 19));
  };

  const handleExpireChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length >= 2) {
      val = val.substring(0, 2) + "/" + val.substring(2, 4);
    }
    setExpire(val.substring(0, 5));
  };

  const handlePayment = () => {
    if (paymentMethod === "click") clickCheckout();
    if (paymentMethod === "payme-site") paymeCheckout();
    if (paymentMethod === "card") cardCheckout();
    if (paymentMethod === "payme") {
      if (paymeStep === "INITIAL") paymeSendSms();
      else paymeConfirmPayment();
    }
  };

  // --- PAYME SUBSCRIBE FLOW ---
  const paymeSendSms = async () => {
    if (cardNumber.length < 19 || expire.length < 5) {
      return toast({
        title: "Xatolik",
        description: "Karta raqami yoki muddatini to'liq kiriting",
        variant: "destructive",
      });
    }

    setLoading(true);
    try {
      const cleanCardNumber = cardNumber.replace(/\s+/g, "");
      const cleanExpire = expire.replace(/\//g, "");

      const { data } = await $api.post("/payme/send-sms", {
        productId: product.id,
        cardNumber: cleanCardNumber,
        expire: cleanExpire,
      });

      if (!data.token) throw new Error(data.message || "Xatolik yuz berdi");

      setPaymeToken(data.token);
      setPaymePhone(data.phone);
      setOrderId(data.orderId);
      setPaymeStep("SMS_VERIFICATION");

      toast({
        title: "Tasdiqlash kodi yuborildi",
        description: `${data.phone} raqamiga SMS kod yuborildi`,
      });
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description:
          error?.response?.data?.message ||
          error.message ||
          "Payme orqali to'lovda xatolik",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const paymeConfirmPayment = async () => {
    if (smsCode.length < 6) {
      return toast({
        title: "Xatolik",
        description: "SMS kodni to'liq kiriting",
        variant: "destructive",
      });
    }

    setLoading(true);
    try {
      const { data } = await $api.post("/payme/confirm-payment", {
        orderId,
        token: paymeToken,
        code: smsCode,
      });

      if (!data.success)
        throw new Error(data.message || "Tasdiqlashda xatolik");

      toast({
        title: "Muvaffaqiyatli",
        description:
          "To'lov muvaffaqiyatli amalga oshirildi! Profilingizdan yuklab olishingiz mumkin.",
      });
      onClose();
      router.push(`/profile?payment=success`);
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description:
          error?.response?.data?.message ||
          error.message ||
          "Tasdiqlashda xatolik",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const paymeCheckout = async () => {
    setLoading(true);
    try {
      const { data } = await $api.post("/payments/checkout/payme", {
        productId: product.id,
        returnUrl: productReturnUrl,
      });

      if (!data.url) throw new Error("Payme URL kelmadi");

      window.location.href = data.url;
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description:
          error?.response?.data?.message ||
          "Payme orqali to'lovda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cardCheckout = async () => {
    setLoading(true);
    try {
      const { data } = await $api.post("/payments/checkout/click-card", {
        productId: product.id,
      });

      if (!window.createPaymentRequest) {
        throw new Error("Click script yuklanmagan");
      }

      onClose();

      await new Promise((r) => setTimeout(r, 50));

      window.createPaymentRequest(
        {
          service_id: data.service_id,
          merchant_id: data.merchant_id,
          amount: data.amount,
          transaction_param: data.transaction_param,
          merchant_user_id: data.merchant_order_id,
        },
        function (result) {
          console.log("CLICK STATUS:", result.status);

          if (result.status === 2) {
            toast({
              title: "Muvaffaqiyatli",
              description:
                "To'lov muvaffaqiyatli amalga oshirildi! Profilingizdan yuklab olishingiz mumkin.",
            });
            router.push(`/profile?payment=success`);
          } else if (result.status < 0) {
            toast({
              title: "Xatolik",
              description: "To'lovda xatolik yuz berdi",
              variant: "destructive",
            });
          }
        },
      );
    } catch (e: any) {
      toast({
        title: "Xatolik",
        description: e.message || "Click bilan to'lovda xatolik",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clickCheckout = async () => {
    setLoading(true);
    try {
      const { data } = await $api.post("/payments/checkout/click", {
        productId: product.id,
        returnUrl: productReturnUrl,
      });

      if (!data.url) throw new Error("Click URL kelmadi");

      window.location.href = data.url;
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description:
          error?.response?.data?.message ||
          "Click orqali to'lovda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const productPrice = preview?.productPrice ?? product.price;
  const siteFee = preview?.buyerCommission ?? 0;
  const totalPrice = preview?.totalAmount ?? product.price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] max-h-[95vh] overflow-y-auto rounded-2xl p-0 gap-0 border-none">
        <div className="sm:p-8 p-5 space-y-6 bg-white">
          {/* Oynani boshi */}
          {paymeStep === "INITIAL" ? (
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setPaymentMethod("payme")}
                className={cn(
                  "relative h-20 rounded-2xl border-2 transition-all flex items-center justify-center p-4 group",
                  paymentMethod === "payme"
                    ? "border-blue-500 bg-blue-50/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                    : "border-gray-100 hover:border-blue-200",
                )}
              >
                <img
                  src="https://hujjat24.uz/payment/uzcard_humo.png"
                  className="w-full object-contain"
                  alt="Uzcard"
                />
                {paymentMethod === "payme" && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-1 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>

              <button
                onClick={() => setPaymentMethod("click")}
                className={cn(
                  "relative h-20 rounded-2xl border-2 transition-all flex items-center justify-center p-4 group",
                  paymentMethod === "click"
                    ? "border-[#00a6ff] bg-blue-50/30 shadow-[0_0_20px_rgba(0,166,255,0.15)]"
                    : "border-gray-100 hover:border-blue-200",
                )}
              >
                <img
                  src="https://api.logobank.uz/media/logos_png/Click-01_hjB080W.png"
                  className="w-full object-contain"
                  alt="Click"
                />
                {paymentMethod === "click" && (
                  <div className="absolute -top-2 -right-2 bg-[#00a6ff] text-white p-1 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>

              <button
                onClick={() => setPaymentMethod("payme-site")}
                className={cn(
                  "relative h-20 rounded-2xl border-2 transition-all flex items-center justify-center p-4 group",
                  paymentMethod === "payme-site"
                    ? "border-[#00a6ff] bg-blue-50/30 shadow-[0_0_20px_rgba(0,166,255,0.15)]"
                    : "border-gray-100 hover:border-blue-200",
                )}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Paymeuz_logo.png"
                  className="w-full object-contain"
                  alt="Payme"
                />
                {paymentMethod === "payme-site" && (
                  <div className="absolute -top-2 -right-2 bg-[#00a6ff] text-white p-1 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-[#00a6ff]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                SMS kodni kiriting
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Tasdiqlash kodi <b>{paymePhone}</b> raqamiga yuborildi
              </p>
            </div>
          )}

          {paymentMethod === "payme" && (
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
              {paymeStep === "INITIAL" ? (
                <>
                  <div className="space-y-3">
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        id="payme-card-num" // Payme talabi: name atributi umuman bo'lmasin!
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardChange}
                        className="w-full bg-white border border-gray-200 rounded-xl h-12 pl-10 pr-4 outline-none focus:border-[#00a6ff] focus:ring-1 focus:ring-[#00a6ff] transition-all"
                      />
                    </div>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        id="payme-card-exp"
                        type="text"
                        placeholder="MM/YY"
                        value={expire}
                        onChange={handleExpireChange}
                        className="w-full bg-white border border-gray-200 rounded-xl h-12 pl-10 pr-4 outline-none focus:border-[#00a6ff] focus:ring-1 focus:ring-[#00a6ff] transition-all"
                      />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-[11px] text-gray-500 text-center leading-tight">
                      Sizning karta ma'lumotlaringiz saytimizda saqlanmaydi va
                      to'g'ridan-to'g'ri Payme serverlariga shifrlangan holda
                      yuboriladi.
                    </p>
                    <div className="flex justify-center items-center gap-1.5 mt-2">
                      <span className="text-[11px] font-medium text-gray-400">
                        Powered by
                      </span>
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Paymeuz_logo.png"
                        className="h-3 opacity-70 grayscale"
                        alt="Payme"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="relative">
                  <input
                    id="payme-sms-code"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={smsCode}
                    onChange={(e) =>
                      setSmsCode(e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full text-center tracking-[0.5em] font-bold text-xl bg-white border border-gray-200 rounded-xl h-14 outline-none focus:border-[#00a6ff] focus:ring-1 focus:ring-[#00a6ff] transition-all"
                  />
                </div>
              )}
            </div>
          )}

          {/* Price Summary (Faqat birinchi qadamda ko'rinsin) */}
          {paymeStep === "INITIAL" && (
            <div className="rounded-[2rem] border border-gray-100 bg-gray-50/40 p-4 space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-gray-500 font-medium">Mahsulot</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(productPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-emerald-600 font-medium">
                  Xizmat haqi
                </span>
                <span className="font-bold text-emerald-600">
                  +{formatPrice(siteFee)}
                </span>
              </div>
              <div className="pt-2 px-1">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Jami to'lov
                    </p>
                    <span className="text-3xl font-black text-gray-900 tracking-tight">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {paymentMethod !== "payme" && (
            <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-2xl p-4 flex gap-4 transition-all hover:bg-emerald-50">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-emerald-100 shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-emerald-900 text-sm">
                  Xavfsiz to'lov tizimi
                </p>
                <p className="text-xs text-emerald-700/80 leading-relaxed font-medium">
                  Xarid jarayonida kiritilgan barcha ma’lumotlar xavfsiz tarzda
                  himoyalanadi.
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            type="submit"
            disabled={loading}
            onClick={handlePayment}
            className={cn(
              "w-full h-12 text-white text-lg font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden",
              paymentMethod === "click" || paymentMethod === "payme"
                ? "bg-[#00a6ff] hover:bg-[#0095e6] shadow-blue-500/25"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/25",
            )}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {paymentMethod === "payme" && paymeStep === "INITIAL"
                ? "Davom etish"
                : paymentMethod === "payme" && paymeStep === "SMS_VERIFICATION"
                  ? "Tasdiqlash va To'lash"
                  : "To'lovni amalga oshiring"}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>

          {/* Bekor qilish (Sms bosqichida orqaga qaytish) */}
          {paymeStep === "SMS_VERIFICATION" && (
            <button
              onClick={() => setPaymeStep("INITIAL")}
              className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              Bekor qilish va orqaga qaytish
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
