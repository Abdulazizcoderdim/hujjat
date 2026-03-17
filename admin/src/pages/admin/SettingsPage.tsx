import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";

export function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    password: "",
    new_password: "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const { data } = await $api.get("/auth/me");
      return data;
    },
  });

  useEffect(() => {
    if (userData?.user) {
      setProfile((prev) => ({
        ...prev,
        full_name: userData?.user.full_name || "",
        email: userData?.user.email || "",
      }));
    }
  }, [userData?.user]);

  const handleUpdateProfile = async () => {
    if (profile.new_password && !profile.password) {
      return toast({
        variant: "destructive",
        title: "Xato",
        description:
          "Yangi parolni o'rnatish uchun joriy parolingizni kiriting!",
      });
    }

    setIsUpdatingProfile(true);
    try {
      await $api.put("/users/profile", profile);
      toast({
        title: "Muvaffaqiyatli",
        description: "Profil ma'lumotlari yangilandi.",
      });
      setProfile((prev) => ({ ...prev, password: "", new_password: "" }));
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Xato",
        description:
          error.response?.data?.message || "Profilni yangilashda xatolik",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("uz-UZ").format(value);
  };

  return (
    <div className="space-y-10 max-w-3xl pb-20">
      <PageHeader
        title="Sozlamalar"
        description="Platforma va profil sozlamalarini boshqarish"
      />

      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <User className="h-5 w-5" /> Profil sozlamalari
        </h2>
        <div className="stat-card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">To'liq ism</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email manzil</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/50">
            <div className="space-y-2">
              <label className="text-sm font-medium text-warning">
                Joriy parol (O'zgartirish uchun)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  type="password"
                  placeholder="********"
                  value={profile.password}
                  onChange={(e) =>
                    setProfile({ ...profile, password: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-success">
                Yangi parol
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  type="password"
                  placeholder="Kamida 4 ta belgi"
                  value={profile.new_password}
                  onChange={(e) =>
                    setProfile({ ...profile, new_password: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdatingProfile}
              className="bg-primary"
            >
              {isUpdatingProfile ? "Yangilanmoqda..." : "Profilni saqlash"}
            </Button>
          </div>
        </div>
      </section>

      <div className="border-t border-border my-8" />
    </div>
  );
}
