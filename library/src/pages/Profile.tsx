import SidebarNav from "@/components/SidebarNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import $api from "@/http/axios";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Building,
  Calendar,
  GraduationCap,
  Hash,
  Layers,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// const data? = {
//   full_name: "ERKINOV JALOLIDDIN UCHQUN O'G'LI",
//   first_name: "JALOLIDDIN",
//   second_name: "ERKINOV",
//   image: "https://hemis.qitu.uz/static/crop/3/2/320_320_90_3226054822.jpg",
//   student_id_number: "483251100023",
//   hemis_id: "9146",
//   faculty: "Pedagogika va raqamli ta'lim",
//   specialty: "Kompyuter injiniringi",
//   group: "KIS-24-12",
//   level: "2-kurs",
//   university: "Osiyo texnologiyalar universiteti",
//   role: "student",
//   is_active: true,
// };

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
    <span className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
      {icon}
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-mono-label text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground break-words">{value}</p>
    </div>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: () => $api.get("/auth/me").then((res) => res.data.user),
  });

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
      <SidebarNav activePage="profile" />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-border bg-card/50 backdrop-blur-md">
          <div className="flex items-center gap-3 pl-12 md:pl-0">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft
                className="w-4 h-4 text-foreground"
                strokeWidth={1.5}
              />
            </button>
            <span className="text-xs text-muted-foreground">Profil</span>
          </div>
        </header>
        <div className="flex-1 px-4 sm:px-8 py-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto"
          >
            {/* Profile Header */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-border">
                  <AvatarImage
                    src={data?.image}
                    alt={data?.full_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-xl font-bold">
                    {data?.first_name[0]}
                    {data?.second_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight font-display text-foreground">
                    {data?.full_name}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data?.specialty}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      <GraduationCap
                        className="w-3.5 h-3.5"
                        strokeWidth={1.5}
                      />
                      {data?.level}
                    </span>
                    {data?.is_active && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-semibold">
                        Faol
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Academic Info */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-xs font-mono-label text-muted-foreground mb-3">
                  O'quv ma'lumotlari
                </h3>
                <InfoRow
                  icon={
                    <Building
                      className="w-4 h-4 text-muted-foreground"
                      strokeWidth={1.5}
                    />
                  }
                  label="Universitet"
                  value={data?.university}
                />
                <InfoRow
                  icon={
                    <BookOpen
                      className="w-4 h-4 text-muted-foreground"
                      strokeWidth={1.5}
                    />
                  }
                  label="Fakultet"
                  value={data?.faculty}
                />
                <InfoRow
                  icon={
                    <Layers
                      className="w-4 h-4 text-muted-foreground"
                      strokeWidth={1.5}
                    />
                  }
                  label="Mutaxassislik"
                  value={data?.specialty}
                />
                <InfoRow
                  icon={
                    <Users
                      className="w-4 h-4 text-muted-foreground"
                      strokeWidth={1.5}
                    />
                  }
                  label="Guruh"
                  value={data?.group}
                />
                <InfoRow
                  icon={
                    <GraduationCap
                      className="w-4 h-4 text-muted-foreground"
                      strokeWidth={1.5}
                    />
                  }
                  label="Bosqich"
                  value={data?.level}
                />
              </div>
              {/* Personal Info */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-xs font-mono-label text-muted-foreground mb-3">
                  Shaxsiy ma'lumotlar
                </h3>
                <InfoRow
                  icon={
                    <Hash
                      className="w-4 h-4 text-muted-foreground"
                      strokeWidth={1.5}
                    />
                  }
                  label="Talaba ID"
                  value={data?.student_id_number}
                />

                <InfoRow
                  icon={
                    <Calendar
                      className="w-4 h-4 text-muted-foreground"
                      strokeWidth={1.5}
                    />
                  }
                  label="Holati"
                  value={data?.is_active ? "Faol talaba" : "Nofaol"}
                />
              </div>
            </div>
            {/* Actions */}
            <div className="mt-4 bg-card border border-border rounded-2xl p-5">
              <h3 className="text-xs font-mono-label text-muted-foreground mb-4">
                Sozlamalar
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleLogout}
                  className="flex-1 h-11 bg-secondary text-secondary-foreground rounded-xl text-sm font-semibold hover:bg-secondary/80 active:scale-[0.98] transition-all"
                >
                  Tizimdan chiqish
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};
export default Profile;
