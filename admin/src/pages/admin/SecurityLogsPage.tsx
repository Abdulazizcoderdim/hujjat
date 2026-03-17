import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/hooks/formatDateTime";
import { useDebounce } from "@/hooks/use-debounce";
import $api from "@/http/axios";
import { safeText } from "@/utils/safe";
import { useQuery } from "@tanstack/react-query";
import { Eye, Search, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusBadgeLogs } from "./StatusBadgeLogs";

type SecurityLogType =
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGIN_FAILED"
  | "OTP_FAILED"
  | "RATE_LIMIT_HIT"
  | "SERVER_ERROR"
  | "ADMIN_ACTION"
  | "ACCESS_DENIED" // Yangi
  | "CLIENT_ERROR"; // Yangi

interface IUserLite {
  _id: string;
  full_name: string;
  role?: string;
}

interface SecurityLog {
  _id: string;
  type: SecurityLogType;
  userId?: IUserLite;
  ip?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  message?: string;
  meta?: Record<string, any>;
  createdAt: string;
}

interface LogsResponse {
  items: SecurityLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const typeOptions: { value: SecurityLogType | "all"; label: string }[] = [
  { value: "all", label: "Barchasi" },
  { value: "ACCESS_DENIED", label: "Ruxsat yo'q (401/403)" },
  { value: "RATE_LIMIT_HIT", label: "Rate limit (429)" },
  { value: "SERVER_ERROR", label: "Server error (500)" },
  { value: "CLIENT_ERROR", label: "Client error (400/404)" },
];

function getTypeBadge(type: SecurityLogType) {
  const map: Record<SecurityLogType, { label: string; variant: any }> = {
    AUTH_LOGIN_SUCCESS: { label: "Login OK", variant: "success" },
    AUTH_LOGIN_FAILED: { label: "Login Xato", variant: "failed" },
    OTP_FAILED: { label: "OTP Xato", variant: "failed" },
    ACCESS_DENIED: { label: "Ruxsat Yo'q", variant: "destructive" },
    RATE_LIMIT_HIT: { label: "429 Limit", variant: "warning" },
    SERVER_ERROR: { label: "500 Error", variant: "failed" },
    CLIENT_ERROR: { label: "Client Error", variant: "neutral" },
    ADMIN_ACTION: { label: "Admin Action", variant: "primary" },
  };

  return map[type] || { label: type, variant: "neutral" };
}

export function SecurityLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const searchDebounce = useDebounce(searchQuery, 500);

  const [typeFilter, setTypeFilter] = useState<SecurityLogType | "all">("all");

  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = (log: SecurityLog) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  const { data, isLoading } = useQuery<LogsResponse>({
    queryKey: [
      "security-logs",
      {
        page,
        limit,
        search: searchDebounce,
        type: typeFilter,
        from,
        to,
      },
    ],
    queryFn: async () => {
      const res = await $api.get("/security-logs", {
        params: {
          page,
          limit,
          search: searchDebounce || undefined,
          type: typeFilter === "all" ? undefined : typeFilter,
          from: from || undefined,
          to: to || undefined,
        },
      });

      return res.data;
    },
    placeholderData: (prev) =>
      prev ?? {
        items: [],
        pagination: { total: 0, page: 1, limit, totalPages: 1 },
      },
  });

  const logs = data?.items || [];
  const pagination = data?.pagination;

  const stats = useMemo(() => {
    let fails = 0;
    let errors = 0;
    let limits = 0;
    let denied = 0;

    for (const l of logs) {
      if (l.type === "AUTH_LOGIN_FAILED" || l.type === "OTP_FAILED") fails++;
      if (l.type === "SERVER_ERROR") errors++;
      if (l.type === "RATE_LIMIT_HIT") limits++;
      if (l.type === "ACCESS_DENIED") denied++;
    }

    return { fails, errors, limits, denied };
  }, [logs]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Xavfsizlik loglari"
        description="IP, kirish urinishlari, xatoliklar va xavfli eventlar monitoringi"
        actions={
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              {pagination?.total ?? 0} ta log
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Login/OTP Xato
          </p>
          <p className="text-lg font-bold text-red-500">{stats.fails}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Ruxsatsiz (403)
          </p>
          <p className="text-lg font-bold text-orange-500">{stats.denied}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">500 Server Error</p>
          <p className="text-lg font-bold text-destructive">{stats.errors}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">429 Rate Limit</p>
          <p className="text-lg font-bold text-blue-500">{stats.limits}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">Sahifa</p>
          <p className="text-lg font-bold text-foreground">
            {pagination?.page ?? 1}/{pagination?.totalPages ?? 1}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="IP, path yoki user bo‘yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as any)}
          >
            <SelectTrigger className="w-full sm:w-52 bg-card border-border">
              <SelectValue placeholder="Event turi" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {typeOptions.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="datetime-local"
            value={from}
            onChange={(e) => {
              setPage(1);
              setFrom(e.target.value);
            }}
            className="w-full sm:w-56 bg-card border-border"
          />

          <Input
            type="datetime-local"
            value={to}
            onChange={(e) => {
              setPage(1);
              setTo(e.target.value);
            }}
            className="w-full sm:w-56 bg-card border-border"
          />
        </div>
      </div>

      <div className="stat-card p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <p className="font-semibold text-foreground">Loglar ro‘yxati</p>
          {isLoading && (
            <span className="text-xs text-muted-foreground">
              Yuklanmoqda...
            </span>
          )}
        </div>

        <DataTable
          columns={[
            {
              key: "createdAt",
              header: "Vaqt",
              render: (l) => (
                <span className="text-muted-foreground whitespace-nowrap">
                  {formatDateTime(l.createdAt)}
                </span>
              ),
            },
            {
              key: "type",
              header: "Event",
              render: (l) => {
                const t = getTypeBadge(l.type);
                return (
                  <StatusBadgeLogs status={t.variant}>
                    {t.label}
                  </StatusBadgeLogs>
                );
              },
            },
            {
              key: "user",
              header: "User",
              render: (l) => safeText(l.userId?.full_name) || "—",
            },
            {
              key: "ip",
              header: "IP",
              render: (l) => (
                <span className="font-mono text-xs text-foreground">
                  {l.ip || "—"}
                </span>
              ),
            },
            {
              key: "path",
              header: "Path",
              render: (l) => (
                <div className="flex flex-col max-w-[200px]">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    {safeText(l.method)}
                  </span>
                  <span className="text-xs truncate" title={l.path}>
                    {safeText(l.path)}
                  </span>
                </div>
              ),
            },
            {
              key: "statusCode",
              header: "Status",
              render: (l) => {
                const code = l.statusCode || 0;
                let color = "text-muted-foreground";
                if (code >= 500) color = "text-red-500 font-bold";
                else if (code >= 400) color = "text-orange-500 font-bold";
                else if (code >= 200) color = "text-green-500";

                return <span className={color}>{code || "—"}</span>;
              },
            },
            {
              key: "actions",
              header: "",
              render: (l) => (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetail(l);
                  }}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              ),
            },
          ]}
          data={logs}
          keyExtractor={(l) => l._id}
          onRowClick={openDetail}
          emptyMessage="Log topilmadi"
        />
      </div>

      <Pagination
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        limit={limit}
        total={pagination?.total}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => setLimit(l)}
      />

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-border max-w-2xl h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Log tafsilotlari
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="stat-card">
                  <p className="text-xs text-muted-foreground">Event</p>
                  <p className="font-semibold text-foreground">
                    {getTypeBadge(selectedLog.type).label} ({selectedLog.type})
                  </p>
                </div>

                <div className="stat-card">
                  <p className="text-xs text-muted-foreground">Vaqt</p>
                  <p className="font-semibold text-foreground">
                    {new Date(selectedLog.createdAt).toLocaleString("uz-UZ")}
                  </p>
                </div>

                <div className="stat-card">
                  <p className="text-xs text-muted-foreground">
                    IP & User Agent
                  </p>
                  <p className="font-mono text-sm text-foreground">
                    {selectedLog.ip || "—"}
                  </p>
                </div>

                <div className="stat-card">
                  <p className="text-xs text-muted-foreground">
                    Method & Status
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{selectedLog.method}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs text-white ${selectedLog.statusCode && selectedLog.statusCode >= 400 ? "bg-red-500" : "bg-green-500"}`}
                    >
                      {selectedLog.statusCode ?? "—"}
                    </span>
                  </div>
                </div>

                <div className="stat-card sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Path</p>
                  <p className="text-sm text-foreground break-all font-mono bg-muted/30 p-1 rounded">
                    {safeText(selectedLog.path)}
                  </p>
                </div>

                {selectedLog.message && (
                  <div className="stat-card sm:col-span-2 bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-500 font-bold">
                      Xatolik Xabari (Message)
                    </p>
                    <p className="text-sm text-red-400 break-all">
                      {selectedLog.message}
                    </p>
                  </div>
                )}

                {selectedLog.userId?.full_name && (
                  <div className="stat-card sm:col-span-2">
                    <p className="text-xs text-muted-foreground">
                      Foydalanuvchi
                    </p>
                    <p className="text-sm text-foreground">
                      {selectedLog.userId.full_name}{" "}
                      <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded">
                        {selectedLog.userId.role || "—"}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {selectedLog.meta && (
                <div className="stat-card">
                  <p className="text-xs text-muted-foreground mb-2">
                    Qo'shimcha ma'lumotlar (Meta)
                  </p>
                  <pre className="text-xs overflow-auto max-h-60 bg-black/50 p-3 rounded-lg border border-border text-green-400 font-mono">
                    {JSON.stringify(selectedLog.meta, null, 2)}
                  </pre>
                </div>
              )}

              <div className="stat-card sm:col-span-2">
                <p className="text-xs text-muted-foreground">User Agent Full</p>
                <p className="text-xs text-muted-foreground break-all">
                  {selectedLog.userAgent || "—"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
