import { BookOpen, Home, LogOut, Menu, Star, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface NavItemProps {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  to?: string;
  onClick?: () => void;
}

const NavItem = ({ icon, label, active, to, onClick }: NavItemProps) => {
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
};

interface SidebarNavProps {
  activePage?: string;
}

const SidebarNav = ({ activePage = "home" }: SidebarNavProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

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
          icon={<BookOpen className="w-5 h-5" strokeWidth={1.5} />}
          label="Mening kitoblarim"
          active={activePage === "mybooks"}
          to="/my-books"
          onClick={close}
        />
        <NavItem
          icon={<Star className="w-5 h-5" strokeWidth={1.5} />}
          label="Saqlanganlar"
          active={activePage === "saved"}
          to="/saved"
          onClick={close}
        />

        <div className="pt-6 pb-2 px-4">
          <span className="text-[10px] font-mono-label text-muted-foreground">
            Fakultetlar
          </span>
        </div>
        <NavItem label="Axborot texnologiyalari" />
        <NavItem label="Iqtisodiyot" />
        <NavItem label="Gumanitar fanlar" />
        <NavItem label="Muhandislik" />
      </nav>

      <div className="px-4 mb-2">
        <button
          onClick={() => {
            close();
            navigate("/login");
          }}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          Chiqish
        </button>
      </div>

      <div className="p-4 mx-4 mb-4 rounded-xl bg-secondary">
        <p className="text-xs font-semibold text-foreground">
          12,482 ta kitob mavjud
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          34 ta yangi qo'shildi
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[280px] flex-shrink-0 border-r border-border flex-col bg-card h-full">
        {sidebarContent}
      </aside>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 w-10 h-10 rounded-xl bg-card border border-border shadow-card flex items-center justify-center"
        aria-label="Menyu"
      >
        <Menu className="w-5 h-5 text-foreground" strokeWidth={1.5} />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={close}
          />
          <aside className="relative w-[280px] max-w-[85vw] flex flex-col bg-card h-full shadow-search animate-in slide-in-from-left duration-200">
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
