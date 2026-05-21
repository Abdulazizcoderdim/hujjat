import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { EntSidebar } from "./EntSidebar";
import { EntTopBar } from "./EntTopBar";

const COLLAPSED_KEY = "ENT_SIDEBAR_COLLAPSED";

export function EntAppLayout() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  // close mobile drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="ent-scope ent-app">
      <EntTopBar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        onOpenMobile={() => setMobileOpen(true)}
      />
      <div className="ent-app__body">
        <EntSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <main className="ent-app__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
