import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Metadata } from "next";
import AuthClient from "./AuthClient";

export const metadata: Metadata = {
  title: "Ro'yhatdan o'tish | DocLab",
  description: "DocLab foydalanuvchi ro'yhatdan o'tish sahifasi.",
  alternates: {
    canonical: "/auth",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <AuthClient />

      <Footer />
    </div>
  );
}
