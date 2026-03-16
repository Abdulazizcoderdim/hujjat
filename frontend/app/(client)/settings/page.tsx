import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Metadata } from "next";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Sozlamalar | DocLab",
  description: "DocLab foydalanuvchi sozlamalari sahifasi.",
  alternates: {
    canonical: "/settings",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 lg:py-12">
        <div className="container-main max-w-3xl">
          <SettingsClient />
        </div>
      </main>
      <Footer />
    </div>
  );
}
