import { UserRole } from "@/interface";
import { authStore } from "@/store/auth.store";
import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NAV, NavChild, NavItem } from "./nav-config";

const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

interface Props {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const matchPath = (location: string, href: string) => {
  if (href === "/") return location === "/";
  return location === href || location.startsWith(href + "/");
};

const findExpandedFor = (location: string): string[] => {
  const open: string[] = [];
  for (const section of NAV) {
    for (const item of section.items) {
      if (
        item.children &&
        item.children.some((c) => matchPath(location, c.href))
      ) {
        open.push(item.href);
      }
    }
  }
  return open;
};

export function EntSidebar({ collapsed, mobileOpen, onMobileClose }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = authStore();
  const role = (user?.role as UserRole) || UserRole.ADMIN;

  const [expanded, setExpanded] = useState<string[]>(() =>
    findExpandedFor(location.pathname),
  );

  // auto-expand the section containing current route
  useEffect(() => {
    setExpanded((prev) => {
      const required = findExpandedFor(location.pathname);
      const merged = Array.from(new Set([...prev, ...required]));
      return merged;
    });
  }, [location.pathname]);

  const visible = useMemo(() => {
    return NAV.map((s) => ({
      ...s,
      items: s.items.filter((i) => !i.roles || i.roles.includes(role)),
    })).filter((s) => s.items.length > 0);
  }, [role]);

  const handleItemClick = (item: NavItem) => {
    if (item.children) {
      if (collapsed) {
        // collapsed mode: clicking parent navigates to first child
        navigate(item.children[0].href);
        return;
      }
      setExpanded((prev) =>
        prev.includes(item.href)
          ? prev.filter((h) => h !== item.href)
          : [...prev, item.href],
      );
    } else {
      navigate(item.href);
      onMobileClose();
    }
  };

  const handleChildClick = (child: NavChild) => {
    navigate(child.href);
    onMobileClose();
  };

  return (
    <>
      {mobileOpen && (
        <div className="ent-sidebar-backdrop" onClick={onMobileClose} />
      )}
      <aside
        className={cx(
          "ent-sidebar",
          collapsed && "ent-sidebar--collapsed",
          mobileOpen && "ent-sidebar--mobile-open",
        )}
        aria-label="Asosiy menyu"
      >
        {visible.map((section, idx) => (
          <div key={section.title ?? `s${idx}`} className="ent-sidebar__section">
            {section.title && !collapsed && (
              <div className="ent-sidebar__section-title">{section.title}</div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isOpen = expanded.includes(item.href);
              const childActive =
                item.children &&
                item.children.some((c) => matchPath(location.pathname, c.href));
              const itemActive = item.children
                ? false
                : matchPath(location.pathname, item.href);
              return (
                <div key={item.href}>
                  <button
                    type="button"
                    className={cx(
                      "ent-nav-item",
                      (itemActive || (collapsed && childActive)) &&
                        "ent-nav-item--active",
                    )}
                    title={collapsed ? item.title : undefined}
                    onClick={() => handleItemClick(item)}
                  >
                    <Icon className="ent-nav-item__icon" strokeWidth={1.75} />
                    <span className="ent-nav-item__label">{item.title}</span>
                    {item.children && (
                      <ChevronRight
                        className={cx(
                          "ent-nav-item__chevron",
                          isOpen && "ent-nav-item__chevron--open",
                        )}
                        strokeWidth={2}
                      />
                    )}
                  </button>
                  {item.children && !collapsed && isOpen && (
                    <div className="ent-nav-children">
                      {item.children
                        .filter((c) => !c.roles || c.roles.includes(role))
                        .map((child) => {
                          const ChildIcon = child.icon;
                          const active = matchPath(
                            location.pathname,
                            child.href,
                          );
                          return (
                            <Link
                              key={child.href}
                              to={child.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleChildClick(child);
                              }}
                              className={cx(
                                "ent-nav-item ent-nav-child",
                                active && "ent-nav-item--active",
                              )}
                            >
                              {ChildIcon && (
                                <ChildIcon
                                  className="ent-nav-item__icon"
                                  strokeWidth={1.75}
                                />
                              )}
                              <span className="ent-nav-item__label">
                                {child.title}
                              </span>
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </aside>
    </>
  );
}
