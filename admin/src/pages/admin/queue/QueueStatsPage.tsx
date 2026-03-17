import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import $api from "@/http/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  RefreshCcw,
} from "lucide-react";

// API dan keladigan ma'lumot turi
interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
}

export const QueueStatsPage = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["queue-stats"],
    queryFn: async () => {
      const response = await $api.get<QueueStats>("/queue/stats");
      return response.data;
    },
    refetchInterval: 30000,
  });

  const QueueAPI = {
    pauseProductIngestion: async () => {
      const { data } = await $api.get("/queue/pause-product-ingestion");
      return data;
    },

    resumeProductIngestion: async () => {
      const { data } = await $api.get("/queue/resume-product-ingestion");
      return data;
    },
  };

  const pauseMutation = useMutation({
    mutationFn: QueueAPI.pauseProductIngestion,
    onSuccess: () => refetch(),
  });

  const resumeMutation = useMutation({
    mutationFn: QueueAPI.resumeProductIngestion,
    onSuccess: () => refetch(),
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 text-red-500">
        <p>Ma'lumotlarni yuklashda xatolik yuz berdi!</p>
        <Button onClick={() => refetch()} variant="outline">
          Qayta urinish
        </Button>
      </div>
    );
  }

  const stats = [
    {
      title: "Kutilmoqda (Waiting)",
      value: data?.waiting || 0,
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      title: "Jarayonda (Active)",
      value: data?.active || 0,
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Bajarildi (Completed)",
      value: data?.completed || 0,
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Xatolik (Failed)",
      value: data?.failed || 0,
      icon: AlertCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      title: "Jami (Total)",
      value: data?.total || 0,
      icon: Layers,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Navbat Statistikasi
        </h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCcw
            className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                Hozirgi holat bo'yicha
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="destructive" onClick={() => pauseMutation.mutate()}>
          ⏸ Pause
        </Button>

        <Button variant="default" onClick={() => resumeMutation.mutate()}>
          ▶ Resume
        </Button>
      </div>
    </div>
  );
};
