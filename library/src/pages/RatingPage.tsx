import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Crown,
  BookOpen,
  User,
  Flame,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SidebarNav from "@/components/SidebarNav";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProfileAvatar from "@/components/ProfileAvatar";

interface Student {
  id: number;
  name: string;
  image: string;
  faculty: string;
  group: string;
  booksRead: number;
  pagesRead: number;
  streak: number;
  level: string;
}

const students: Student[] = [
  {
    id: 1,
    name: "Erkinov Jaloliddin",
    image: "https://hemis.qitu.uz/static/crop/3/2/320_320_90_3226054822.jpg",
    faculty: "Pedagogika va raqamli ta'lim",
    group: "KIS-24-12",
    booksRead: 47,
    pagesRead: 12840,
    streak: 21,
    level: "Oltin",
  },
  {
    id: 2,
    name: "Karimova Nodira",
    image: "",
    faculty: "Iqtisodiyot",
    group: "IQ-23-05",
    booksRead: 42,
    pagesRead: 11200,
    streak: 18,
    level: "Oltin",
  },
  {
    id: 3,
    name: "Rahimov Sardor",
    image: "",
    faculty: "Axborot texnologiyalari",
    group: "AT-24-03",
    booksRead: 38,
    pagesRead: 9800,
    streak: 15,
    level: "Kumush",
  },
  {
    id: 4,
    name: "Toshmatova Dilnoza",
    image: "",
    faculty: "Gumanitar fanlar",
    group: "GF-23-08",
    booksRead: 35,
    pagesRead: 9100,
    streak: 12,
    level: "Kumush",
  },
  {
    id: 5,
    name: "Abdullayev Bekzod",
    image: "",
    faculty: "Muhandislik",
    group: "MH-24-01",
    booksRead: 31,
    pagesRead: 8400,
    streak: 10,
    level: "Kumush",
  },
  {
    id: 6,
    name: "Yusupova Malika",
    image: "",
    faculty: "Iqtisodiyot",
    group: "IQ-24-02",
    booksRead: 28,
    pagesRead: 7200,
    streak: 8,
    level: "Bronza",
  },
  {
    id: 7,
    name: "Hasanov Otabek",
    image: "",
    faculty: "Axborot texnologiyalari",
    group: "AT-23-07",
    booksRead: 25,
    pagesRead: 6500,
    streak: 7,
    level: "Bronza",
  },
  {
    id: 8,
    name: "Mirzayeva Shaxlo",
    image: "",
    faculty: "Pedagogika va raqamli ta'lim",
    group: "PRT-24-04",
    booksRead: 22,
    pagesRead: 5800,
    streak: 5,
    level: "Bronza",
  },
  {
    id: 9,
    name: "Qodirov Jasur",
    image: "",
    faculty: "Muhandislik",
    group: "MH-23-06",
    booksRead: 19,
    pagesRead: 4900,
    streak: 4,
    level: "Bronza",
  },
  {
    id: 10,
    name: "Sultanova Kamola",
    image: "",
    faculty: "Gumanitar fanlar",
    group: "GF-24-09",
    booksRead: 16,
    pagesRead: 4100,
    streak: 3,
    level: "Bronza",
  },
];

const getRankIcon = (rank: number) => {
  if (rank === 1)
    return <Crown className="w-5 h-5 text-yellow-500" strokeWidth={1.5} />;
  if (rank === 2)
    return <Medal className="w-5 h-5 text-gray-400" strokeWidth={1.5} />;
  if (rank === 3)
    return <Medal className="w-5 h-5 text-amber-600" strokeWidth={1.5} />;
  return (
    <span className="text-xs font-bold text-muted-foreground w-5 text-center">
      {rank}
    </span>
  );
};

const getLevelColor = (level: string) => {
  if (level === "Oltin")
    return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  if (level === "Kumush")
    return "bg-gray-400/10 text-gray-500 border-gray-400/20";
  return "bg-amber-600/10 text-amber-700 border-amber-600/20";
};

const TopThreeCard = ({
  student,
  rank,
}: {
  student: Student;
  rank: number;
}) => {
  const sizes =
    rank === 1
      ? {
          avatar: "w-20 h-20 sm:w-24 sm:h-24",
          ring: "ring-4 ring-yellow-400/40",
          card: "order-1 sm:order-2 sm:-mt-4",
        }
      : rank === 2
        ? {
            avatar: "w-16 h-16 sm:w-20 sm:h-20",
            ring: "ring-3 ring-gray-300/40",
            card: "order-2 sm:order-1",
          }
        : {
            avatar: "w-16 h-16 sm:w-20 sm:h-20",
            ring: "ring-3 ring-amber-500/30",
            card: "order-3 sm:order-3",
          };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: rank * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center ${sizes.card}`}
    >
      <div className="relative mb-3">
        <Avatar
          className={`${sizes.avatar} ${sizes.ring} border-2 border-card`}
        >
          <AvatarImage
            src={student.image}
            alt={student.name}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
            {student.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-sm">
          {getRankIcon(rank)}
        </div>
      </div>
      <h3 className="text-xs sm:text-sm font-bold text-foreground text-center leading-tight">
        {student.name}
      </h3>
      <p className="text-[10px] text-muted-foreground mt-0.5">
        {student.group}
      </p>
      <div className="flex items-center gap-1 mt-2">
        <BookOpen className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
        <span className="text-xs font-bold text-primary">
          {student.booksRead} kitob
        </span>
      </div>
    </motion.div>
  );
};

const Leaderboard = () => {
  const navigate = useNavigate();

  return (
    <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
      <SidebarNav activePage="leaderboard" />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-border bg-card/50 backdrop-blur-md">
          <div className="flex items-center gap-3 pl-12 md:pl-0">
            <Trophy className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <span className="text-xs text-muted-foreground">Reyting</span>
          </div>
          <div className="flex items-center gap-3">
            <ProfileAvatar />
          </div>
        </header>

        <div className="flex-1 px-4 sm:px-8 py-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto"
          >
            {/* Title */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-display">
                Talabalar reytingi
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Eng ko'p kitob o'qigan talabalar
              </p>
            </div>

            {/* Top 3 Podium */}
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-8 mb-4">
              <div className="flex flex-col sm:flex-row items-end justify-center gap-6 sm:gap-10">
                {students.slice(0, 3).map((s, i) => (
                  <TopThreeCard key={s.id} student={s} rank={i + 1} />
                ))}
              </div>
            </div>
            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-card border border-border rounded-xl p-3 sm:p-4 text-center">
                <BookOpen
                  className="w-4 h-4 text-primary mx-auto mb-1.5"
                  strokeWidth={1.5}
                />
                <p className="text-lg sm:text-xl font-bold text-foreground">
                  303
                </p>
                <p className="text-[10px] text-muted-foreground font-mono-label">
                  Kitoblar
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 sm:p-4 text-center">
                <Flame
                  className="w-4 h-4 text-destructive mx-auto mb-1.5"
                  strokeWidth={1.5}
                />
                <p className="text-lg sm:text-xl font-bold text-foreground">
                  21
                </p>
                <p className="text-[10px] text-muted-foreground font-mono-label">
                  Eng yuqori streak
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 sm:p-4 text-center">
                <TrendingUp
                  className="w-4 h-4 text-accent mx-auto mb-1.5"
                  strokeWidth={1.5}
                />
                <p className="text-lg sm:text-xl font-bold text-foreground">
                  79,840
                </p>
                <p className="text-[10px] text-muted-foreground font-mono-label">
                  Sahifalar
                </p>
              </div>
            </div>

            {/* Full Ranking List */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-4 sm:px-5 py-3 border-b border-border">
                <h3 className="text-xs font-mono-label text-muted-foreground">
                  To'liq reyting
                </h3>
              </div>
              <div className="divide-y divide-border">
                {students.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    className={`flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-secondary/50 transition-colors ${index < 3 ? "bg-primary/[0.02]" : ""}`}
                  >
                    <div className="w-7 flex-shrink-0 flex justify-center">
                      {getRankIcon(index + 1)}
                    </div>
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarImage
                        src={student.image}
                        alt={student.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {student.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {student.faculty} · {student.group}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                      <Flame
                        className="w-3.5 h-3.5 text-destructive/60"
                        strokeWidth={1.5}
                      />
                      <span className="text-xs text-muted-foreground">
                        {student.streak} kun
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <BookOpen
                        className="w-3.5 h-3.5 text-primary/60"
                        strokeWidth={1.5}
                      />
                      <span className="text-xs font-bold text-foreground">
                        {student.booksRead}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 hidden sm:block ${getLevelColor(student.level)}`}
                    >
                      {student.level}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
