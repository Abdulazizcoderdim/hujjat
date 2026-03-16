"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { authStore } from "@/store/auth.store";
import { ArrowLeft, Save, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface UpdateProfileData {
  full_name?: string;
  email?: string;
  bio?: string;
}

export default function SettingsClient() {
  const { toast } = useToast();
  const { user } = authStore();

  const [name, setName] = useState(user.full_name || "");
  const [email, setEmail] = useState(user.email || "");
  const [bio, setBio] = useState(user.bio || "");
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    setName(user.full_name || "");
    setEmail(user.email || "");
    setBio(user.bio || "");
  }, [user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: UpdateProfileData = {
      full_name: name,
      email,
      bio,
    };

    try {
      setIsSaving(true);
      await $api.put("/users/profile", payload);
      toast({
        title: "Muvaffaqiyatli",
        description: "Profil yangilandi",
      });
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description:
          error?.response?.data?.message ||
          "Profilni yangilashda xatolik yuz berdi",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Profilga qaytish</span>
        </Link>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Sozlamalar
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground">
                Profil ma'lumotlari
              </h2>
              <p className="text-sm text-muted-foreground">
                Shaxsiy ma'lumotlaringizni tahrirlang
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ism</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ismingiz"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="O'zingiz haqingizda qisqacha..."
                rows={3}
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button
            disabled={isSaving}
            variant="hero"
            type="submit"
            className="px-8"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Yuklanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </form>
    </>
  );
}
