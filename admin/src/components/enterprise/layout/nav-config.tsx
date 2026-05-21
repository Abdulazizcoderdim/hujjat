import { UserRole } from "@/interface";
import {
  BookOpen,
  ChartBarBig,
  FileBarChart2,
  FileCheck2,
  FileText,
  FileX2,
  FolderTree,
  LayoutDashboard,
  Library,
  ListChecks,
  Package,
  RefreshCw,
  RotateCcw,
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
  "/categories": "Kategoriyalar",
  "/products": "Mahsulotlar",
  "/products/upload": "Yuklash",
  "/products/approved": "Tasdiqlangan",
  "/products/rejected": "Rad etilgan",
  "/library": "Kutubxona",
  "/library/catalog": "Katalog",
  "/library/loans": "Qarzlar",
  "/library/return": "Tezkor qaytarish",
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
