import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import ProfileClient from "@/components/ProfileClient";

const Page = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 lg:py-12">
        <div className="container-main">
          <ProfileClient />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Page;
