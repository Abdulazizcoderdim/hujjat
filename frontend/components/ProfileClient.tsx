"use client";

import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/data/user";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { IOrder, IProduct, IUser } from "@/interface";
import { formatUzDate } from "@/lib/formatDate";
import {
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  LogOut,
  Settings,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface UserProfile {
  profile: IUser;
  orders: IOrder<IProduct<string, string>>[];
}

const fallbackAvatar =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4aBWkRW_4MK9JvZ8w4y7Wp-Tvz6dJhf9gPA&s";

const ProfileClient = () => {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPaymentAlert, setShowPaymentAlert] = useState(false);

  // To'lovdan qaytganda alert ko'rsatish
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      setShowPaymentAlert(true);
      // URL'dan query param'ni olib tashlash
      window.history.replaceState({}, "", "/profile");
    }
  }, [searchParams]);

  const profileName = useMemo(
    () => profileData?.profile?.full_name || "DocLab muallifi",
    [profileData],
  );

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const { data } = await $api.get<UserProfile>("/users/profile");
        if (!active) return;
        setProfileData(data);
        if (data?.profile?.full_name) {
          document.title = `${data.profile.full_name} | DocLab profil`;
        }
      } catch (error: any) {
        if (!active) return;
        setErrorMessage(
          error?.response?.data?.message ||
            "Profil ma'lumotlarini yuklab bo'lmadi.",
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Rostdan ham chiqmoqchimisiz?")) {
      setLoading(true);
      try {
        await $api.post("/auth/logout");
        localStorage.removeItem("USER_ACCESS_TOKEN");

        toast({
          title: "Muvaffaqiyatli!",
          description: "Tizimdan chiqdingiz",
        });
      } catch (error: any) {
        toast({
          title: error?.response?.data?.message || "Xatolik",
          description: "Iltimoms qaytadan urinib ko'ring!",
        });
        console.log(error);
      } finally {
        setLoading(false);
        router.push("/");
        router.refresh();
        window.location.reload();
      }
    }
  };

  const handleDownload = async (productId: string) => {
    try {
      const { data } = await $api.get(`/downloads/${productId}`);

      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = data.filename || "file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      toast({
        title: "Yuklab bo‘lmadi",
        description:
          error?.response?.data?.message ||
          "Sizda bu hujjatni yuklash huquqi yo‘q",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center">Loading...</div>;
  }

  if (errorMessage) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground mb-4">{errorMessage}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Qayta urinib ko&apos;rish
        </Button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Profil ma&apos;lumotlari topilmadi.
      </div>
    );
  }

  const avatarUrl = profileData.profile.avatar || fallbackAvatar;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: profileName,
            description:
              profileData.profile.bio ||
              "DocLab platformasidagi muallif profili",
            email: profileData.profile.email || undefined,
            image: avatarUrl,
          }),
        }}
      />

      {/* To'lov muvaffaqiyatli alert */}
      {showPaymentAlert && (
        <div className="mb-6 relative bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-emerald-900 text-lg">
              To&apos;lov muvaffaqiyatli amalga oshirildi!
            </h3>
            <p className="text-emerald-700 text-sm mt-1">
              Sotib olgan hujjatingiz quyida ko&apos;rsatilgan. &quot;Yuklab olish&quot; tugmasini bosib yuklab olishingiz mumkin.
            </p>
          </div>
          <button
            onClick={() => setShowPaymentAlert(false)}
            className="text-emerald-400 hover:text-emerald-600 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
            {/* Avatar */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-secondary">
                {currentUser.avatar || profileData.profile.avatar ? (
                  <img
                    src={avatarUrl}
                    alt={profileData.profile.full_name || "Nomalum"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              {profileData.profile.full_name && (
                <h2 className="font-display font-bold text-xl text-foreground">
                  {profileData.profile.full_name}
                </h2>
              )}
              {profileData.profile.email && (
                <p className="text-sm text-muted-foreground">
                  {profileData.profile.email}
                </p>
              )}
            </div>

            {/* Info */}
            <div className="space-y-3 mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">
                  {formatUzDate(profileData.profile.createdAt)} dan beri
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">
                  {profileData.orders.length} ta xarid qilingan hujjat
                </span>
              </div>
            </div>

            {/* Bio */}
            {profileData.profile.bio && (
              <p className="text-sm text-muted-foreground mb-6">
                {profileData.profile.bio}
              </p>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Link href="/settings">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Sozlamalar
                </Button>
              </Link>

              <Button
                disabled={loading}
                onClick={() => handleLogout()}
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Chiqish
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Purchased Products */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Xarid qilingan hujjatlar
              </h2>
            </div>

            {profileData.orders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {profileData.orders.map((order, index) => (
                  <div key={order._id ?? index} className="relative">
                    <ProductCard
                      product={order.productId}
                      className={`animate-fade-up stagger-${(index % 5) + 1}`}
                      isBuy={true}
                      order={order}
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <Button
                        onClick={() => handleDownload(order.productId._id)}
                        size="sm"
                        variant="accent"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Yuklab olish
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-secondary/50 rounded-2xl p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  Hozircha xarid qilingan hujjatlar yo&apos;q
                </h3>
                <p className="text-muted-foreground mb-6">
                  Kerakli hujjatlarni topish uchun bozorni ko&apos;ring
                </p>
                <Link href="/products">
                  <Button variant="hero">Hujjatlarni ko&apos;rish</Button>
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default ProfileClient;
