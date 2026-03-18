"use client";

import { Button } from "@/components/ui/button";
import { currentUser } from "@/data/user";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { IUser } from "@/interface";
import { formatUzDate } from "@/lib/formatDate";
import { Calendar, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface UserProfile {
  user: IUser;
}

const fallbackAvatar =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4aBWkRW_4MK9JvZ8w4y7Wp-Tvz6dJhf9gPA&s";

const ProfileClient = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const profileName = useMemo(
    () => profileData?.user?.full_name || "DocLab muallifi",
    [profileData],
  );

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const { data } = await $api.get<UserProfile>("/auth/me");
        if (!active) return;

        setProfileData(data);

        if (data?.user?.full_name) {
          document.title = `${data.user.full_name} | DocLab profil`;
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

  const avatarUrl = profileData.user.image;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: profileName,
            email: profileData.user.email || undefined,
            image: avatarUrl,
          }),
        }}
      />

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
            {/* Avatar */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-secondary">
                {currentUser.avatar || profileData.user.image ? (
                  <img
                    src={avatarUrl}
                    alt={profileData.user.full_name || "Nomalum"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              {profileData.user.full_name && (
                <h2 className="font-display font-bold text-xl text-foreground">
                  {profileData.user.full_name}
                </h2>
              )}
              {profileData.user.email && (
                <p className="text-sm text-muted-foreground">
                  {profileData.user.email}
                </p>
              )}
            </div>

            {/* Info */}
            <div className="space-y-3 mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">
                  {formatUzDate(profileData?.user?.createdAt)} dan beri
                </span>
              </div>
            </div>

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
                Kitoblar
              </h2>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default ProfileClient;
