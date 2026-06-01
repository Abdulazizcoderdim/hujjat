import { UserRole } from "@/interface";
import {
  Activity,
  BookOpen,
  ChartBarBig,
  ClipboardList,
  FileBarChart2,
  FileCheck2,
  FileText,
  FileX2,
  FolderTree,
  KeyRound,
  LayoutDashboard,
  Library,
  ListChecks,
  MessageSquarePlus,
  Package,
  RefreshCw,
  RotateCcw,
  ScrollText,
  Settings,
  ShieldCheck,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavChild {
  title: string;
  href: string;
  icon?: LucideIcon;
  roles?: UserRole[];
}

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
  children?: NavChild[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  {
    items: [
      {
        title: "Boshqaruv paneli",
        href: "/",
        icon: LayoutDashboard,
        roles: [UserRole.ADMIN],
      },
    ],
  },
  // ============ OPERATOR-only section ============
  {
    title: "Kitoblar",
    items: [
      {
        title: "Kitob yuklash",
        href: "/products/upload",
        icon: Upload,
        roles: [UserRole.OPERATOR],
      },
      {
        title: "Mening yuklaganlarim",
        href: "/products/my-uploads",
        icon: FileText,
        roles: [UserRole.OPERATOR],
      },
    ],
  },
  {
    title: "Foydalanuvchilar",
    items: [
      {
        title: "Foydalanuvchilar",
        href: "/users",
        icon: Users,
        roles: [UserRole.ADMIN],
        children: [
          { title: "Talabalar", href: "/users/students", icon: Users },
          { title: "Adminlar", href: "/users/admins", icon: ShieldCheck },
          {
            title: "Operatorlar monitoringi",
            href: "/monitoring",
            icon: Activity,
          },
          {
            title: "HEMIS sinxronizatsiya",
            href: "/users/sync",
            icon: RefreshCw,
          },
        ],
      },
    ],
  },
  {
    title: "Resurslar",
    items: [
      {
        title: "Kategoriyalar",
        href: "/categories",
        icon: FolderTree,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Kitob so'rovlari",
        href: "/requests",
        icon: MessageSquarePlus,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Mahsulotlar",
        href: "/products",
        icon: Package,
        roles: [UserRole.ADMIN],
        children: [
          {
            title: "Yuklash",
            href: "/products/upload",
            icon: Upload,
          },
          {
            title: "Tasdiqlangan",
            href: "/products/approved",
            icon: FileCheck2,
          },
          {
            title: "Rad etilgan",
            href: "/products/rejected",
            icon: FileX2,
          },
        ],
      },
    ],
  },
  {
    title: "Kutubxona",
    items: [
      {
        title: "Kutubxona",
        href: "/library",
        icon: Library,
        roles: [UserRole.ADMIN],
        children: [
          {
            title: "Katalog",
            href: "/library/catalog",
            icon: BookOpen,
          },
          {
            title: "Qarzlar",
            href: "/library/loans",
            icon: ListChecks,
          },
          {
            title: "Tezkor qaytarish",
            href: "/library/return",
            icon: RotateCcw,
          },
        ],
      },
    ],
  },
  {
    title: "Audit",
    items: [
      {
        title: "Audit jurnali",
        href: "/audit",
        icon: ScrollText,
        roles: [UserRole.ADMIN],
        children: [
          {
            title: "Umumiy ko'rinish",
            href: "/audit",
            icon: Activity,
          },
          {
            title: "Loginlar",
            href: "/audit/logins",
            icon: KeyRound,
          },
          {
            title: "O'qish sessiyalari",
            href: "/audit/sessions",
            icon: BookOpen,
          },
          {
            title: "Admin amallari",
            href: "/audit/actions",
            icon: ClipboardList,
          },
        ],
      },
    ],
  },
  {
    title: "Tizim",
    items: [
      {
        title: "Sozlamalar",
        href: "/settings",
        icon: Settings,
        roles: [UserRole.ADMIN],
      },
    ],
  },
];

/* Used by TopBar to render breadcrumbs from current location */
export const PATH_TITLES: Record<string, string> = {
  "/": "Boshqaruv paneli",
  "/users": "Foydalanuvchilar",
  "/users/students": "Talabalar",
  "/users/admins": "Adminlar",
  "/users/sync": "HEMIS sinxronizatsiya",
  "/monitoring": "Operatorlar monitoringi",
  "/products/my-uploads": "Mening yuklaganlarim",
  "/categories": "Kategoriyalar",
  "/requests": "Kitob so'rovlari",
  "/products": "Mahsulotlar",
  "/products/upload": "Yuklash",
  "/products/approved": "Tasdiqlangan",
  "/products/rejected": "Rad etilgan",
  "/library": "Kutubxona",
  "/library/catalog": "Katalog",
  "/library/loans": "Qarzlar",
  "/library/return": "Tezkor qaytarish",
  "/audit": "Audit",
  "/audit/logins": "Loginlar",
  "/audit/sessions": "O'qish sessiyalari",
  "/audit/actions": "Admin amallari",
  "/settings": "Sozlamalar",
};

/* Paths that are parent groups only — they have no page, so breadcrumb
   should render them as plain text (not links). */
export const NON_NAVIGABLE_PATHS = new Set<string>([
  "/users",
  "/products",
  "/library",
]);

// re-export so layout can keep icon mapping in one place
export { ChartBarBig, FileBarChart2, FileText };
