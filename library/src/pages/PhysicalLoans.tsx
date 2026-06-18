import Header from "@/components/Header";
import SidebarNav from "@/components/SidebarNav";
import $api from "@/http/axios";
import { ICategory, ILoan, IProduct } from "@/interface";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Hash,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type LoanItem = ILoan<IProduct<ICategory>> & {
  product: IProduct<ICategory> & { shelfCode?: string };
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const daysLeft = (dueIso: string) => {
  const diff = new Date(dueIso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const PhysicalLoans = () => {
  const navigate = useNavigate();

  const { data: loans = [], isLoading } = useQuery<LoanItem[]>({
    queryKey: ["my-physical-loans"],
    queryFn: async () => {
      const { data } = await $api.get("/loans/me");
      return data;
    },
  });

  const active = useMemo(() => loans.filter((l) => l.status === "active"), [loans]);
  const returned = useMemo(() => loans.filter((l) => l.status === "returned"), [loans]);

  return (
    <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
      <SidebarNav activePage="physical-loans" />

      <main className="flex-1 flex flex-col min-w-0">
        <Header title="Olingan kitoblarim" />

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-card/50 animate-pulse"
                />
              ))}
            </div>
          ) : loans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-4">
                <BookOpen className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-medium mb-1.5">
                Sizda olingan kitob yo'q
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Kutubxonadan kitob olganingizda u shu yerda paydo bo'ladi.
              </p>
              <button
                onClick={() => navigate("/products")}
                className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Katalogga o'tish
              </button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Active loans */}
              {active.length > 0 && (
                <section>
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="text-sm sm:text-base font-semibold">
                      Hozir olganlaringiz
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {active.length} ta
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {active.map((loan, i) => {
                      const days = daysLeft(loan.dueAt);
                      const overdue = days < 0;
                      const soon = days >= 0 && days <= 3;
                      return (
                        <motion.button
                          key={loan.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: i * 0.05,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          onClick={() =>
                            navigate(`/book/${loan.product.id}`)
                          }
                          className="flex gap-4 rounded-xl border border-border bg-card p-4 cursor-pointer hover:shadow-card transition-shadow"
                        >
                          <img
                            src={loan.product.poster}
                            alt={loan.product.name}
                            className="w-16 sm:w-20 h-24 sm:h-28 rounded-lg object-cover flex-shrink-0 bg-muted"
                          />
                          <div className="flex-1 min-w-0 flex flex-col">
                            <h4 className="text-sm sm:text-base font-semibold truncate">
                              {loan.product.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              {loan.product.author}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                              {loan.product.shelfCode && (
                                <span className="inline-flex items-center gap-1 text-muted-foreground">
                                  <Hash className="w-3 h-3" />
                                  <span className="font-mono">
                                    {loan.product.shelfCode}
                                  </span>
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                Berilgan: {formatDate(loan.borrowedAt)}
                              </span>
                            </div>

                            <div className="mt-auto pt-3 flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                                  overdue
                                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                    : soon
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                }`}
                              >
                                {overdue ? (
                                  <AlertCircle className="w-3.5 h-3.5" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5" />
                                )}
                                {overdue
                                  ? `Muddati ${Math.abs(days)} ${Math.abs(days) > 1 ? "kunlar" : "kun"} oldin tugagan`
                                  : days === 0
                                    ? "Bugun qaytarish kerak"
                                    : `${days} ${days > 1 ? "kunlar" : "kun"} qoldi`}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Qaytarish: {formatDate(loan.dueAt)}
                              </span>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Returned */}
              {returned.length > 0 && (
                <section>
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="text-sm sm:text-base font-semibold">
                      Avval olib qaytarganlaringiz
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {returned.length} ta
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {returned.map((loan) => (
                      <div
                        key={loan.id}
                        onClick={() => navigate(`/book/${loan.product.id}`)}
                        className="flex gap-3 rounded-lg border border-border/60 bg-card/60 p-3 cursor-pointer hover:bg-card transition-colors"
                      >
                        <img
                          src={loan.product.poster}
                          alt={loan.product.name}
                          className="w-12 h-16 rounded object-cover flex-shrink-0 bg-muted"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium truncate">
                            {loan.product.name}
                          </h5>
                          <p className="text-xs text-muted-foreground truncate">
                            {loan.product.author}
                          </p>
                          <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            Qaytarilgan ·{" "}
                            {formatDate(loan.returnedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PhysicalLoans;
