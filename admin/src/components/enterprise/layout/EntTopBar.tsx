import $api from "@/http/axios";
import { authStore } from "@/store/auth.store";
import { useMutation } from "@tanstack/react-query";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Fragment, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NON_NAVIGABLE_PATHS, PATH_TITLES } from "./nav-config";

const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

interface Props {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenMobile: () => void;
}

interface Crumb {
  label: string;
  href?: string;
}

const buildCrumbs = (pathname: string): Crumb[] => {
  if (pathname === "/" || pathname === "")
    return [{ label: PATH_TITLES["/"] ?? "Bosh sahifa" }];
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ label: "Bosh", href: "/" }];
  let acc = "";
  parts.forEach((p, i) => {
    acc += "/" + p;
    const title = PATH_TITLES[acc] ?? p;
    const isLast = i === parts.length - 1;
    const isNavigable = !NON_NAVIGABLE_PATHS.has(acc);
    crumbs.push(
      isLast || !isNavigable ? { label: title } : { label: title, href: acc },
    );
  });
  return crumbs;
};

export function EntTopBar({ collapsed, onToggleCollapsed, onOpenMobile }: Props) {
  const { user } = authStore();
  const location = useLocation();
  const navigate = useNavigate();

  const crumbs = useMemo(() => buildCrumbs(location.pathname), [
    location.pathname,
  ]);

  const logoutMu = useMutation({
    mutationFn: async () => {
      await $api.post("/auth/logout").catch(() => undefined);
    },
    onSuccess: () => {
      localStorage.removeItem("ADMIN_ACCESS_TOKEN");
      navigate("/login");
      window.location.reload();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Chiqishda xato"),
  });

  return (
    <div className="ent-topbar" role="banner">
      {/* Desktop: collapse toggle */}
      <button
        type="button"
        className="ent-topbar__collapse ent-hide-mobile"
        onClick={onToggleCollapsed}
        title={collapsed ? "Panelni ochish" : "Panelni yopish"}
        aria-label={collapsed ? "Panelni ochish" : "Panelni yopish"}
        style={{ marginLeft: 4 }}
      >
        {collapsed ? (
          <PanelLeftOpen size={14} />
        ) : (
          <PanelLeftClose size={14} />
        )}
      </button>

      {/* Mobile: hamburger */}
      <button
        type="button"
        className="ent-topbar__collapse ent-show-mobile"
        onClick={onOpenMobile}
        title="Menyu"
        aria-label="Menyu"
        style={{ marginLeft: 4 }}
      >
        <Menu size={14} />
      </button>

      <Link to="/" className="ent-topbar__brand">
        <span>OTU</span>
        <span className="ent-muted" style={{ fontWeight: 400, fontSize: 11 }}>
          / KUTUBXONA ADMIN
        </span>
      </Link>

      <nav className="ent-topbar__breadcrumb" aria-label="Yo'l">
        {crumbs.map((c, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="ent-topbar__crumb-sep">›</span>}
            {c.href ? (
              <Link to={c.href}>{c.label}</Link>
            ) : (
              <span style={{ color: "var(--ent-text)" }}>{c.label}</span>
            )}
          </Fragment>
        ))}
      </nav>

      <div className="ent-topbar__user">
        <div
          className="ent-hide-mobile"
          style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}
        >
          <span className="ent-topbar__user-name">
            {user?.full_name || user?.login || "Admin"}
          </span>
          <span className="ent-topbar__user-role">{user?.role || "—"}</span>
        </div>
        <button
          type="button"
          className="ent-topbar__collapse"
          onClick={() => {
            if (window.confirm("Chiqishni xohlaysizmi?"))
              logoutMu.mutate();
          }}
          title="Chiqish"
          aria-label="Chiqish"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}

// expose cx so other layout files can reuse if needed
export { cx };
