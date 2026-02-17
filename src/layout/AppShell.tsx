import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  type LucideIcon,
  CalendarSearch,
  DoorOpen,
  HandCoins,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/auth/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
};

const navItems: NavItem[] = [
  { to: "/", label: "Beranda", icon: LayoutDashboard },
  { to: "/rooms", label: "Ruangan", icon: DoorOpen },
  { to: "/availability", label: "Ketersediaan", icon: CalendarSearch },
  { to: "/loans", label: "Peminjaman", icon: HandCoins },
  { to: "/admin", label: "Admin", icon: ShieldCheck, roles: ["Admin"] },
];

export function AppShell() {
  const navigate = useNavigate();
  const { hasRole, logout, user } = useAuth();

  const visibleNav = navItems.filter((item) => !item.roles || item.roles.some((role) => hasRole(role)));

  const onLogout = () => {
    const ok = window.confirm("Keluar dari aplikasi?");
    if (!ok) return;

    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="flex">
        <aside className="fixed left-0 top-0 h-screen w-[280px] border-r bg-background/95 backdrop-blur">
          <div className="flex h-full flex-col">
            {/* Brand */}
            <div className="px-6 pb-7 pt-8">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="text-xl font-semibold uppercase tracking-[0.14em] leading-none">PARAS</div>
                <div className="max-w-[170px] text-xs leading-relaxed text-muted-foreground/90">Sistem Peminjaman Ruangan Kampus</div>
              </div>
            </div>

            <Separator />

            {/* Nav */}
            <nav className="px-3 py-3">
              <ul className="space-y-1">
                {visibleNav.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                          isActive
                            ? "bg-primary/10 text-foreground"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer */}
            <div className="mt-auto px-6 pb-6 pt-3">
              <Separator className="mb-4" />

              <div className="space-y-3">
                <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs">
                  <div className="font-medium">{user?.fullName || user?.nrp || "-"}</div>
                  <div className="text-muted-foreground">Role: {user?.roles.join(", ") || "-"}</div>
                </div>

                <Button variant="outline" className="w-full justify-start" onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </Button>

                <div className="text-[11px] text-muted-foreground">Copyright © 2026 · maestrorafa05</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="ml-[280px] min-h-screen w-full p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
