import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";

const COLLAPSED_KEY = "ADMIN_SIDEBAR_COLLAPSED";

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-blue-700 dark:bg-slate-950 border-b border-blue-900/50 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="text-white hover:bg-blue-800/50"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <span className="font-extrabold text-lg text-white ml-3">OTU</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
      />

      <main
        className={cn(
          "min-h-screen pt-14 lg:pt-0 transition-[padding] duration-300 ease-in-out",
          collapsed ? "lg:pl-20" : "lg:pl-64",
        )}
      >
        <div className="p-4 sm:p-6 dark:bg-[#080C16] bg-gray-50 min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
