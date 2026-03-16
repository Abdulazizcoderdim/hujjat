import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Metadata } from "next";
import HelpClient from "./HelpClient";

export const metadata: Metadata = {
  title: "Yordam Markazi | DocLab",
  description:
    "DocLab platformasi bo'yicha tez-tez so'raladigan savollar va yordam markazi.",
};

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HelpClient />
      <Footer />
    </div>
  );
}
