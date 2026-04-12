import { Link, Navigate, Outlet, useLocation } from "react-router";
import { Home, Calendar, Users, CreditCard, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";
import { useAuth } from "~/hooks/useAuth";
import { Role } from "~/enums/role.enum";

export default function ManagerLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { to: "/manager/dashboard", icon: Home, label: t("manager.nav.dashboard") },
    { to: "/manager/menu", icon: Calendar, label: t("manager.nav.menu") },
    { to: "/manager/members", icon: Users, label: t("manager.nav.members") },
    { to: "/manager/meal-billing", icon: CreditCard, label: t("manager.nav.billing") },
    { to: "/manager/settings", icon: Settings, label: t("manager.nav.settings") },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5ECD5]">
        <div className="w-8 h-8 border-4 border-[#626F47] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === Role.MEMBER)
    return <Navigate to="/member/dashboard" replace />;
  if (user?.role === Role.ADMIN)
    return <Navigate to="/admin/dashboard" replace />;

  return (
    <div className="min-h-screen bg-[#F5ECD5] relative pb-[66px]">
      <Outlet />
      <nav className="fixed bottom-0 left-0 right-0 h-[66px] bg-[#FBF5E8] border-t-2 border-[#D9CEB4] shadow-[0_-2px_8px_rgba(74,60,30,0.1)] flex items-center px-1 z-50">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 px-1 relative",
                active ? "text-[#626F47]" : "text-[#A09070]",
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-[3px] bg-[#F0BB78] rounded-b-[3px]" />
              )}
              <Icon size={22} />
              <span className="text-[10px] font-semibold font-sans">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
