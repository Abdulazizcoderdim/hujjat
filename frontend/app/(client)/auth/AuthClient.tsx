"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios"; // Axios instancengiz
import { UserRole } from "@/interface";
import { authStore } from "@/store/auth.store";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowLeft, Send } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type AuthMode = "main" | "telegram" | "email-otp";
type AuthMethod = "phone" | "email";

const AuthClient = () => {
  const [mode, setMode] = useState<AuthMode>("main");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("phone");

  const [otpValue, setOtpValue] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+998");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const { setIsAuth, setUser, isAuth, setLoading } = authStore();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    if (isAuth) {
      router.push(callbackUrl);
    }
  }, [isAuth, router, callbackUrl]);

  const handleLoginSuccess = () => {
    router.refresh();
  };

  const checkRoleAndLogin = (data: any) => {
    if (data.user.role !== UserRole.BUYER) {
      toast({
        title: "Xatolik",
        description:
          "Siz sotuvchi yoki admin sifatida bu hisob orqali ro'yhatdan o'tgansiz. Xaridor hisobidan foydalaning.",
      });
      return;
    }
    localStorage.setItem("USER_ACCESS_TOKEN", data.accessToken);
    setUser(data.user);
    setIsAuth(true);
    handleLoginSuccess();
    toast({ title: "Muvaffaqiyatli!", description: "Tizimga kirdingiz" });
  };

  const showErrorToast = (error: any) => {
    let errorMessage = "Iltimos qaytadan urinib ko'ring!";
    const responseMessage = error?.response?.data?.message;

    if (Array.isArray(responseMessage)) {
      errorMessage = responseMessage[0];
    } else if (responseMessage) {
      errorMessage = responseMessage;
    }

    toast({
      title: "Xatolik",
      description: errorMessage,
      variant: "destructive",
    });
    console.log("Auth Error: >>>", error);
  };

  // --- 1. EMAIL ORQALI KOD SO'RASH API ---
  const handleEmailSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Xatolik",
        description: "To'g'ri email manzilini kiriting!",
      });
      return;
    }

    setIsLoading(true);
    try {
      await $api.post("/auth/email/send-code", { email: email.toLowerCase() });
      setMode("email-otp");
      setOtpValue("");
      toast({
        title: "Jo'natildi",
        description: "Emailingizga tasdiqlash kodi yuborildi.",
      });
    } catch (error: any) {
      showErrorToast(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. EMAIL KODINI TASDIQLASH API ---
  const handleEmailVerify = async () => {
    if (otpValue.length !== 6) return;
    setIsLoading(true);
    try {
      // NestJS: AuthController.verifyEmailCode (@Body() dto: VerifyEmailCodeDto)
      const { data } = await $api.post("/auth/email/verify", {
        email: email.toLowerCase(),
        code: otpValue,
      });
      // Backenddan { accessToken, user, message } qaytadi
      checkRoleAndLogin(data);
    } catch (error: any) {
      showErrorToast(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. TELEFON ORQALI KIRISH API ---
  const formatPhoneNumber = (value: string) => {
    let numbers = value.replace(/\D/g, "");
    if (!numbers.startsWith("998")) numbers = "998" + numbers;
    numbers = numbers.slice(0, 12);

    let result = "+998";
    if (numbers.length > 3) result += ` (${numbers.slice(3, 5)}`;
    if (numbers.length > 5) result += `) ${numbers.slice(5, 8)}`;
    if (numbers.length > 8) result += `-${numbers.slice(8, 10)}`;
    if (numbers.length > 10) result += `-${numbers.slice(10, 12)}`;
    return result;
  };

  const handlePhoneSubmit = async () => {
    const cleanPhone = phone.replace(/\D/g, ""); // "998901234567" holatiga keladi
    if (cleanPhone.length !== 12) {
      toast({
        title: "Xatolik",
        description: "Telefon raqamni to'liq kiriting!",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await $api.post("/auth/phone", {
        phone: "+" + cleanPhone,
      });
      checkRoleAndLogin(data);
    } catch (error: any) {
      showErrorToast(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. TELEGRAM LOGIN ---
  const handleTelegramVerify = async () => {
    if (otpValue.length !== 6) return;
    setIsLoading(true);
    try {
      const { data } = await $api.post("/auth/telegram", { code: otpValue });
      checkRoleAndLogin(data);
    } catch (error: any) {
      showErrorToast(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-elegant sm:p-8 p-6 border border-border/50">
          {/* ASOSIY OYNA */}
          {mode === "main" && (
            <div className="space-y-6 animate-fade-up">
              <div className="text-center">
                <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Tizimga kirish
                </h1>
                <p className="text-muted-foreground text-sm">
                  O'zingizga qulay usulda ro'yxatdan o'ting
                </p>
              </div>

              {/* TABS */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setAuthMethod("phone")}
                  className={`py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    authMethod === "phone"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Telefon orqali
                </button>
                <button
                  onClick={() => setAuthMethod("email")}
                  className={`py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    authMethod === "email"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Email orqali
                </button>
              </div>

              {/* FORMALAR */}
              <div className="mt-4">
                {authMethod === "phone" ? (
                  <div className="space-y-4 animate-fade-up">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-foreground">
                        Telefon raqamingiz
                      </label>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) =>
                          setPhone(formatPhoneNumber(e.target.value))
                        }
                        className="h-11 font-medium tracking-wide text-base"
                        placeholder="+998 (__) ___-__-__"
                      />
                    </div>
                    <Button
                      className="w-full h-11 text-base font-medium"
                      onClick={handlePhoneSubmit}
                      disabled={
                        phone.replace(/\D/g, "").length !== 12 || isLoading
                      }
                    >
                      {isLoading ? "Kirilmoqda..." : "Kirish"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-up">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-foreground">
                        Elektron pochta
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 text-base"
                        placeholder="misol@gmail.com"
                      />
                    </div>
                    <Button
                      className="w-full h-11 text-base font-medium"
                      onClick={handleEmailSubmit}
                      disabled={!email || isLoading}
                    >
                      {isLoading ? "Yuborilmoqda..." : "Kodni olish"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/60"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-card text-muted-foreground">
                    Yoki
                  </span>
                </div>
              </div>

              {/* BOSHQA USULLAR */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-11 text-base justify-center gap-3 hover:bg-[#0088cc]/5 hover:text-[#0088cc] hover:border-[#0088cc] transition-all"
                  onClick={() => {
                    setMode("telegram");
                    setOtpValue("");
                  }}
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/500px-Telegram_logo.svg.png"
                    className="w-5 h-5 object-contain"
                    alt="Telegram"
                  />
                  <span>Telegram bilan kirish</span>
                </Button>

                <div className="flex justify-center w-full [&>div]:w-full [&_iframe]:w-full">
                  <GoogleLogin
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    text="continue_with"
                    logo_alignment="center"
                    onSuccess={async (res) => {
                      setLoading(true);
                      try {
                        const { data } = await $api.post("/auth/google", {
                          idToken: res.credential,
                        });
                        checkRoleAndLogin(data);
                      } catch (error: any) {
                        showErrorToast(error);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    onError={() => {
                      setLoading(false);
                      toast({
                        title: "Xatolik",
                        description: "Iltimos qaytadan urinib ko'ring!",
                        variant: "destructive",
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* EMAIL OTP OYNASI */}
          {mode === "email-otp" && (
            <div className="space-y-6 animate-fade-up">
              <button
                onClick={() => {
                  setMode("main");
                  setOtpValue("");
                }}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> <span>Orqaga</span>
              </button>

              <div className="text-center">
                <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Tasdiqlash kodi
                </h1>
                <p className="text-muted-foreground text-sm">
                  <span className="font-medium text-foreground">{email}</span>{" "}
                  manziliga yuborilgan 6 xonali kodni kiriting.
                </p>
              </div>

              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                className="w-full h-11"
                onClick={handleEmailVerify}
                disabled={otpValue.length !== 6 || isLoading}
              >
                {isLoading ? "Tekshirilmoqda..." : "Tasdiqlash"}
              </Button>
            </div>
          )}

          {/* TELEGRAM OTP OYNASI */}
          {mode === "telegram" && (
            <div className="space-y-6 animate-fade-up">
              <button
                onClick={() => {
                  setMode("main");
                  setOtpValue("");
                }}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> <span>Orqaga</span>
              </button>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#0088cc]/10 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-[#0088cc]" />
                </div>
                <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Kodni kiriting
                </h1>
                <p className="text-muted-foreground text-sm">
                  Telegram botiga o'ting{" "}
                  <a
                    href="https://t.me/Doclabuzbot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0088cc] font-medium hover:underline"
                  >
                    @Doclabuzbot
                  </a>{" "}
                  va tasdiqlash kodini oling.
                </p>
              </div>

              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                className="w-full h-11"
                onClick={handleTelegramVerify}
                disabled={otpValue.length !== 6 || isLoading}
              >
                {isLoading ? "Tekshirilmoqda..." : "Tasdiqlash"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AuthClient;
