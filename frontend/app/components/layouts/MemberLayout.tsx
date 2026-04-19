import { Link, Outlet, useLocation } from "react-router";
import { Home, Calendar, Receipt, Split, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";
import { useAuth } from "~/hooks/useAuth";

export default function MemberLayout() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();

  const navItems = [
    { to: "/member/dashboard", icon: Home, label: t("member.nav.home") },
    { to: "/member/menu", icon: Calendar, label: t("member.nav.menu") },
    { to: "/member/meal-bills", icon: Receipt, label: t("member.nav.bills") },
    { to: "/member/shared-bills", icon: Split, label: t("member.nav.shared") },
    { to: "/member/settings", icon: Settings, label: t("member.nav.more") },
  ];

  return (
    <div className="min-h-screen bg-[#F5ECD5]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[220px] bg-[#FBF5E8] border-r-2 border-[#D9CEB4] z-50">
        <div className="px-5 py-5 border-b border-[#D9CEB4]">
          <p className="font-display font-bold text-[18px] text-[#2C2F1E]">
            {t("common.appName")}
          </p>
          <p className="text-[11px] text-[#6B7550] truncate">{user?.messName}</p>
        </div>
        <nav className="flex-1 py-3">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 text-[13px] font-semibold border-l-4 transition-colors",
                  active
                    ? "border-[#F0BB78] text-[#626F47] bg-[rgba(98,111,71,0.07)]"
                    : "border-transparent text-[#A09070] hover:text-[#626F47] hover:bg-[rgba(98,111,71,0.04)]",
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-[#D9CEB4] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F0BB78] flex items-center justify-center font-bold text-[13px] text-[#2C2F1E] shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "M"}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[#2C2F1E] truncate">{user?.name}</p>
            <p className="text-[10px] text-[#6B7550]">{user?.messCode}</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="relative pb-[66px] md:pb-0 md:pl-[220px]">
        <Outlet />
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-[66px] bg-[#FBF5E8] border-t-2 border-[#D9CEB4] shadow-[0_-2px_8px_rgba(74,60,30,0.1)] flex items-center px-1 z-50 md:hidden">
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
              <span className="text-[10px] font-semibold font-sans">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
