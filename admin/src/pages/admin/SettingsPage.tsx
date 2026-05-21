import {
  EntButton,
  EntCard,
  EntField,
  EntInput,
  EntPage,
  EntToolbar,
} from "@/components/enterprise";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function SettingsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    password: "",
    new_password: "",
  });
  const [saving, setSaving] = useState(false);

  const { data: userData } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => (await $api.get("/auth/me")).data,
  });

  useEffect(() => {
    if (userData?.user) {
      setProfile((prev) => ({
        ...prev,
        full_name: userData.user.full_name || "",
        email: userData.user.email || "",
      }));
    }
  }, [userData?.user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.new_password && !profile.password) {
      toast({
        variant: "destructive",
        title: "Xato",
        description:
          "Yangi parolni o'rnatish uchun joriy parolingizni kiriting",
      });
      return;
    }
    setSaving(true);
    try {
      await $api.put("/users/profile", profile);
      toast({ title: "Profil yangilandi" });
      setProfile((prev) => ({ ...prev, password: "", new_password: "" }));
      qc.invalidateQueries({ queryKey: ["admin-profile"] });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Xato",
        description: err?.response?.data?.message || "Yangilashda xato",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <EntPage>
      <EntToolbar title="Sozlamalar" />

      <div style={{ padding: 6, maxWidth: 720 }}>
        <form onSubmit={handleSubmit} className="ent-stack-y">
          <EntCard title="Profil ma'lumotlari">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <EntField label="To'liq ism" required>
                <EntInput
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  required
                />
              </EntField>
              <EntField label="Email" required>
                <EntInput
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  required
                />
              </EntField>
            </div>
          </EntCard>

          <EntCard title="Parolni o'zgartirish (ixtiyoriy)">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <EntField
                label="Joriy parol"
                hint="Yangi parolni o'rnatish uchun zarur"
              >
                <EntInput
                  type="password"
                  value={profile.password}
                  onChange={(e) =>
                    setProfile({ ...profile, password: e.target.value })
                  }
                  placeholder="********"
                  autoComplete="current-password"
                />
              </EntField>
              <EntField label="Yangi parol" hint="kamida 4 ta belgi">
                <EntInput
                  type="password"
                  value={profile.new_password}
                  onChange={(e) =>
                    setProfile({ ...profile, new_password: e.target.value })
                  }
                  minLength={4}
                  placeholder="********"
                  autoComplete="new-password"
                />
              </EntField>
            </div>
          </EntCard>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
            <EntButton type="submit" variant="primary" disabled={saving}>
              {saving ? "Saqlanmoqda..." : "Profilni saqlash"}
            </EntButton>
          </div>
        </form>
      </div>
    </EntPage>
  );
}
