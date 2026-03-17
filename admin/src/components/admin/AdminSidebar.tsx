import { Button } from "@/components/ui/button";
import $api from "@/http/axios";
import { UserRole } from "@/interface";
import { cn } from "@/lib/utils";
import { authStore } from "@/store/auth.store";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  FolderOpen,
  Layers,
  LayoutDashboard,
  LogOut,
  Logs,
  MessageSquare,
  Newspaper,
  Package,
  Receipt,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Menu, X } from "lucide-react";

interface NavChild {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  children?: NavChild[];
}

const navItems: NavItem[] = [
  {
    title: "Boshqaruv paneli",
    href: "/",
    icon: LayoutDashboard,
    roles: [UserRole.ADMIN],
  },
  {
    title: "Foydalanuvchilar",
    href: "/users",
    icon: Users,
    roles: [UserRole.ADMIN],
    children: [
      { title: "Xaridorlar", href: "/users/buyers", icon: Users },
      { title: "Sotuvchilar", href: "/users/sellers", icon: Store },
      { title: "Moderatorlar", href: "/users/moderators", icon: Shield },
    ],
  },
  {
    title: "Kategoriyalar",
    href: "/categories",
    icon: FolderOpen,
    roles: [UserRole.ADMIN],
  },
  {
    title: "Mahsulotlar",
    href: "/products",
    icon: Package,
    roles: [UserRole.ADMIN, UserRole.MODERATOR],
    children: [
      {
        title: "Kutilmoqda",
        href: "/products/pending",
        icon: FileText,
        roles: [UserRole.ADMIN, UserRole.MODERATOR],
      },
      {
        title: "Tasdiqlangan",
        href: "/products/approved",
        icon: FileText,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Rad etilgan",
        href: "/products/rejected",
        icon: FileText,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Qayta generatsiya",
        href: "/products/regenerate",
        icon: FileText,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Qayta preview qilish",
        href: "/products/preview",
        icon: FileText,
        roles: [UserRole.ADMIN],
      },
    ],
  },
  {
    title: "Moliya",
    href: "/finance",
    icon: CreditCard,
    roles: [UserRole.ADMIN],
    children: [
      { title: "Buyurtmalar", href: "/finance/orders", icon: ShoppingCart },
      {
        title: "To'lovlar tahlili",
        href: "/finance/orders-breakdown",
        icon: Receipt,
      },
      {
        title: "Tranzaksiyalar",
        href: "/finance/transactions",
        icon: ArrowRightLeft,
      },
      { title: "Pul yechish", href: "/finance/withdrawals", icon: Wallet },
      {
        title: "Qaytarish so'rovlari",
        href: "/finance/refunds",
        icon: ArrowRightLeft,
      },
    ],
  },
  {
    title: "Takliflar",
    href: "/offers",
    icon: MessageSquare,
    roles: [UserRole.ADMIN],
  },
  {
    title: "Yangiliklar",
    href: "/promos",
    icon: Newspaper,
    roles: [UserRole.ADMIN],
  },
  {
    title: "Logs",
    href: "/security-logs",
    icon: Logs,
    roles: [UserRole.ADMIN],
  },
  { title: "Navbat statistikasi", href: "/queue-stats", icon: Layers, roles: [UserRole.ADMIN] },
  {
    title: "Sozlamalar",
    href: "/settings",
    icon: Settings,
    roles: [UserRole.ADMIN],
  },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = authStore();

  // Mobileda sahifa o'zgarganda menyu yopilsin
  useEffect(() => {
    onMobileClose?.();
  }, [location.pathname]);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((i) => i !== href) : [...prev, href],
    );
  };

  const isActive = (href: string) => location.pathname === href;

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role),
  );

  const handleLogout = useMutation({
    mutationFn: async () => {
      const { data } = await $api.post("/auth/logout");

      return data;
    },
    onSuccess: () => {
      localStorage.removeItem("ADMIN_ACCESS_TOKEN");
      navigate("/login");
      window.location.reload();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Xatolik iltimoms qaytadan urinib ko'ring!",
      );
    },
  });

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out",
        "bg-blue-700 dark:bg-slate-950 border-r border-blue-900/50 shadow-[0_0_20px_rgba(30,58,138,0.2)]",
        // Desktop
        "hidden lg:block",
        collapsed ? "lg:w-20" : "lg:w-64",

        
        mobileOpen && "!block w-72",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header - Logo qismi */}
        <div className="flex h-20 items-center justify-between px-6">
          {!collapsed && (
            <div className="flex items-center gap-3 animate-in fade-in duration-500">
              <div className="h-10 w-10 rounded-2xl bg-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Doclab
              </span>
            </div>
          )}

          {/* Mobile: X tugmasi */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMobileClose?.()}
            className="lg:hidden text-blue-300 hover:text-white hover:bg-blue-800/50 rounded-xl"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Desktop: collapse tugmasi */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "hidden lg:flex text-blue-300 hover:text-white hover:bg-blue-800/50 rounded-xl transition-all",
              collapsed && "mx-auto",
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-6 w-6" />
            ) : (
              <ChevronLeft className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Navigation - Menyu qismi */}
        <nav className="flex-1 min-h-0 overflow-y-auto px-4 py-6 no-scrollbar">
          <ul className="space-y-2">
            {filteredNavItems.map((item) => {
              const visibleChildren = item.children?.filter(
                (child) => !child.roles || child.roles.includes(user.role),
              );

              const isExpanded = expandedItems.includes(item.href);
              const active = isActive(item.href);

              return (
                <li key={item.href} className="group">
                  {visibleChildren ? (
                    <>
                      <button
                        onClick={() => !collapsed && toggleExpanded(item.href)}
                        className={cn(
                          "flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-[15px] font-medium transition-all duration-300",
                          "text-blue-100/70 hover:bg-blue-800/40 hover:text-white",
                          isExpanded &&
                            !collapsed &&
                            "bg-blue-800/30 text-white shadow-inner",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 transition-transform group-hover:scale-110",
                            collapsed && "mx-auto",
                            active || isExpanded
                              ? "text-blue-400"
                              : "text-white",
                          )}
                        />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">
                              {item.title}
                            </span>
                            <ChevronRight
                              className={cn(
                                "h-4 w-4 transition-transform duration-300 opacity-60",
                                isExpanded &&
                                  "rotate-90 opacity-100 text-blue-400",
                              )}
                            />
                          </>
                        )}
                      </button>

                      {!collapsed && isExpanded && (
                        <ul className="mt-2 ml-7 space-y-1.5 border-l-2 border-blue-100/50 pl-4 animate-in slide-in-from-left-2 duration-300">
                          {visibleChildren.map((child) => (
                            <li key={child.href}>
                              <NavLink
                                to={child.href}
                                className={cn(
                                  "flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                                  isActive(child.href)
                                    ? "bg-blue-500/10 text-blue-400 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)] border border-blue-500/20"
                                    : "text-white hover:text-blue-100 hover:translate-x-1",
                                )}
                              >
                                <child.icon className="h-4 w-4" />
                                {child.title}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <NavLink
                      to={item.href}
                      className={cn(
                        "flex items-center gap-4 rounded-2xl px-4 py-3 text-[15px] font-medium transition-all duration-300",
                        isActive(item.href)
                          ? "bg-blue-600 text-white shadow-[0_4_15px_rgba(37,99,235,0.4)]"
                          : "text-white hover:bg-blue-800/40 hover:text-white border border-transparent",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 transition-transform group-hover:scale-110",
                          collapsed && "mx-auto",
                          isActive(item.href) ? "text-white" : "text-white",
                        )}
                      />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - Chiqish qismi */}
        <div className="border-t border-blue-900/50 bg-blue-950/10">
          <button
            onClick={() => {
              if (window.confirm("Rostdan ham chiqmoqchimisiz?"))
                handleLogout.mutate();
            }}
            className={cn(
              "flex items-center gap-4 w-full px-4 py-3 rounded-2xl text-[15px] font-semibold transition-all duration-300",
              "text-white hover:bg-blue-500/10 hover:text-black group",
              collapsed && "justify-center",
            )}
          >
            <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            {!collapsed && <span>Chiqish</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
