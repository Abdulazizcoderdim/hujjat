import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { PlatformSettings } from "@/interface"; // IUser ni import qilamiz
import { ExportButton } from "@/utils/ExportButtons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Lock,
  Mail,
  Percent,
  Save,
  User,
  Wallet,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";

export function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState<PlatformSettings>({
    sellerCommissionRate: 0,
    buyerCommissionRate: 0,
    minWithdrawalAmount: 0,
    repairMode: false,
  } as PlatformSettings);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    password: "",
    new_password: "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await $api.get("/admin/settings");
      return data;
    },
  });

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const { data } = await $api.get("/users/profile");
      return data;
    },
  });

  useEffect(() => {
    if (settingsData) setSettings(settingsData);
  }, [settingsData]);

  useEffect(() => {
    if (userData?.profile) {
      setProfile((prev) => ({
        ...prev,
        full_name: userData?.profile.full_name || "",
        email: userData?.profile.email || "",
      }));
    }
  }, [userData?.profile]);

  if (settingsLoading || userLoading) {
    return <div className="p-8 text-center">Yuklanmoqda...</div>;
  }

  const exportDatabase = async () => {
    try {
      setLoading(true);
      const { data } = await $api.post("/admin/export-database");

      // const response = await fetch(
      //   `${import.meta.env.VITE_API_URL}/admin/download/${data.fileName}`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${localStorage.getItem("ADMIN_ACCESS_TOKEN")}`,
      //     },
      //   },
      // );

      window.location.href = `${import.meta.env.VITE_API_URL}/admin/download/${data.fileName}`;

      // if (!response.ok) {
      //   throw new Error("Download failed");
      // }

      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);

      // const a = document.createElement("a");
      // a.href = url;
      // a.download = data.fileName;
      // document.body.appendChild(a);
      // a.click();

      // a.remove();

      // window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Export failed",
        description:
          error?.message ||
          error?.response?.data?.message ||
          "Database export error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { data } = await $api.patch("/admin/settings", settings);
      setSettings(data);
      toast({
        title: "Muvaffaqiyatli",
        description: "Tizim sozlamalari saqlandi.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Xato",
        description: error.response?.data?.message || "Xatolik yuz berdi",
      });
    } finally {
      setIsSaving(false);
    }
  };

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

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Wrench className="h-5 w-5" /> Tizim sozlamalari
          </h2>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saqlanmoqda..." : "Tizimni saqlash"}
          </Button>
        </div>

        {/* Warning Banner */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <p className="text-sm text-warning">
            Bu sozlamalar platformaning asosiy moliyaviy va texnik ishiga ta'sir
            qiladi.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Komissiyalar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="stat-card flex gap-4">
              <div className="p-3 rounded-xl bg-primary/20 h-fit">
                <Percent className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-sm">Sotuvchi komissiyasi</h3>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings?.sellerCommissionRate}
                    onChange={(e) =>
                      setSettings({
                        ...settings!,
                        sellerCommissionRate: +e.target.value,
                      })
                    }
                    className="w-20 sm:w-24"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            <div className="stat-card flex gap-4">
              <div className="p-3 rounded-xl bg-primary/20 h-fit">
                <Percent className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-sm">Xaridor komissiyasi</h3>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings?.buyerCommissionRate}
                    onChange={(e) =>
                      setSettings({
                        ...settings!,
                        buyerCommissionRate: +e.target.value,
                      })
                    }
                    className="w-20 sm:w-24"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Minimal Withdrawal */}
          <div className="stat-card flex gap-4">
            <div className="p-3 rounded-xl bg-success/20 h-fit">
              <Wallet className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="font-semibold">Minimal pul yechish summasi</h3>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={settings?.minWithdrawalAmount}
                  onChange={(e) =>
                    setSettings({
                      ...settings!,
                      minWithdrawalAmount: +e.target.value,
                    })
                  }
                  className="w-28 sm:w-40"
                />
                <span className="text-muted-foreground">so'm</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Hozirgi: {formatCurrency(settings?.minWithdrawalAmount || 0)}{" "}
                so'm
              </p>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="stat-card flex gap-4 border-destructive/20">
            <div className="p-3 rounded-xl bg-destructive/20 h-fit">
              <Wrench className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  Ta'mirlash rejimi (Maintenance)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Platformani vaqtincha yopish
                </p>
              </div>
              <Switch
                checked={settings?.repairMode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings!, repairMode: checked })
                }
              />
            </div>
          </div>
        </div>
      </section>

      <div className="border rounded-lg p-4 space-y-3">
        <h2 className="font-medium">Database</h2>

        <Button
          disabled={loading}
          variant="destructive"
          onClick={exportDatabase}
        >
          {loading
            ? "Loading..."
            : "To'liq ma'lumotlar bazasini eksport qilish"}
        </Button>

        <p className="text-sm text-muted-foreground">
          Bu maʼlumotlar bazasining toʻliq zaxira nusxasini (.gz) yuklab oladi.
          Faqat uchun foydalaning favqulodda vaziyat yoki migratsiya.
        </p>
      </div>

      <ExportButton />

      {/* <div className="pt-6 border-t border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Tizim jurnallari
        </h2>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">
            To'lov xatolari, callback so'rovlari va yuklab olish xatolari
            jurnallari bu yerda ko'rsatiladi. (Kelgusida qo'shiladi)
          </p>
          <div className="mt-4 p-8 rounded-lg border border-dashed border-border flex items-center justify-center">
            <p className="text-muted-foreground">Jurnallar mavjud emas</p>
          </div>
        </div>
      </div> */}
    </div>
  );
}
