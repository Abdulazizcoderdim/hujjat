import $api from "@/http/axios";
import { ICategory } from "@/interface";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authStore } from "@/store/auth.store";
import {
  BookOpen,
  BookMarked,
  ChartBarStacked,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  MessageSquarePlus,
  Satellite,
  Star,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface NavItemProps {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  to?: string;
  onClick?: () => void;
}

const NavItem = React.memo(({ icon, label, active, to, onClick }: NavItemProps) => {
  const content = (
    <div
      className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
        active
          ? "bg-primary/10 text-primary font-semibold"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {icon && <span className="w-5 h-5 flex-shrink-0">{icon}</span>}
      {!icon && <span className="w-5 h-5 flex-shrink-0" />}
      {label}
    </div>
  );

  if (to) {
    return (
      <Link to={to} onClick={onClick}>
        {content}
      </Link>
    );
  }
  return <button className="w-full">{content}</button>;
});

interface SidebarNavProps {
  activePage?: string;
}

interface Category {
  items: ICategory[];
}

const SidebarNav = ({ activePage = "home" }: SidebarNavProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setIsAuth } = authStore();
  const [open, setOpen] = useState(false);

  const { data: categories } = useQuery<Category>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await $api.get("/categories");
      return res.data;
    },
  });

  const { data: booksCount } = useQuery<number>({
    queryKey: ["books-count"],
    queryFn: async () => {
      const res = await $api.get("/products/books/count");
      return res.data;
    },
  });

  const close = () => setOpen(false);

  const handleLogout = () => {
    queryClient.clear();
    setIsAuth(false);
    localStorage.removeItem("access_token");
    localStorage.removeItem("hemis_token");
    navigate("/login");
  };

  const sidebarContent = (
    <>
      <div className="p-6 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7">
            <img src="/favicon.svg" className="object-contain" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-primary font-display">
              OTU Kutubxonasi
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono-label">
              Raqamli kutubxona
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <NavItem
          icon={<Home className="w-5 h-5" strokeWidth={1.5} />}
          label="Asosiy"
          active={activePage === "home"}
          to="/"
          onClick={close}
        />
        <NavItem
          icon={<GraduationCap className="w-5 h-5" strokeWidth={1.5} />}
          label="O'quv reja kitoblarim"
          active={activePage === "curriculum"}
          to="/curriculum-books"
          onClick={close}
        />
        <NavItem
          icon={<BookOpen className="w-5 h-5" strokeWidth={1.5} />}
          label="Mening kitoblarim"
          active={activePage === "mybooks"}
          to="/my-books"
          onClick={close}
        />
        <NavItem
          icon={<BookMarked className="w-5 h-5" strokeWidth={1.5} />}
          label="Olingan kitoblarim"
          active={activePage === "physical-loans"}
          to="/physical-loans"
          onClick={close}
        />
        <NavItem
          icon={<Star className="w-5 h-5" strokeWidth={1.5} />}
          label="Saqlanganlar"
          active={activePage === "saved"}
          to="/saved"
          onClick={close}
        />
        <NavItem
          icon={<MessageSquarePlus className="w-5 h-5" strokeWidth={1.5} />}
          label="Kitob so'rash"
          active={activePage === "my-requests"}
          to="/my-requests"
          onClick={close}
        />
        {/*
        <NavItem
          icon={<ChartBarStacked className="w-5 h-5" strokeWidth={1.5} />}
          label="Reyting"
          active={activePage === "rating"}
          to="/rating"
          onClick={close}
        /> */}

        <div className="pt-6 pb-2 px-4">
          <span className="text-[10px] font-mono-label text-muted-foreground">
            Kategoriyalar
          </span>
        </div>
        {categories?.items?.map((category) => (
          <NavItem
            key={category.id}
            label={category.name}
            active={activePage === `category/${category.slug}`}
            to={`/category/${category.slug}`}
            onClick={close}
          />
        ))}
      </nav>

      <div className="px-4 mb-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          Chiqish
        </button>
      </div>

      <div className="p-4 mx-4 mb-4 rounded-xl bg-secondary">
        <p className="text-xs font-semibold text-foreground">
          {booksCount?.toLocaleString() || 0} ta kitob mavjud
        </p>
        {/* <p className="text-[10px] text-muted-foreground mt-0.5">
          34 ta yangi qo'shildi
        </p> */}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[280px] max-w-[85vw] flex-shrink-0 border-r border-border flex-col bg-card h-full">
        {sidebarContent}
      </aside>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className={`md:hidden fixed top-4 left-4 z-50 w-11 h-11 rounded-xl bg-card border border-border shadow-card flex items-center justify-center`}
        aria-label="Menyu"
      >
        <Menu className="w-5 h-5 text-foreground" strokeWidth={1.5} />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          onKeyDown={(e) => e.key === "Escape" && close()}
        >
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={close}
          />
          <aside
            className="relative w-[280px] max-w-[85vw] flex flex-col bg-card h-full shadow-search animate-in slide-in-from-left duration-200"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                close();
              }
            }}
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"
              aria-label="Yopish"
            >
              <X className="w-4 h-4 text-foreground" strokeWidth={1.5} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default SidebarNav;
