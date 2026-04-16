import { Link, Outlet, useLocation } from "react-router";
import { Home, Calendar, Receipt, Split, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";

export default function MemberLayout() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { to: "/member/dashboard", icon: Home, label: t("member.nav.home") },
    { to: "/member/menu", icon: Calendar, label: t("member.nav.menu") },
    { to: "/member/meal-bills", icon: Receipt, label: t("member.nav.bills") },
    { to: "/member/shared-bills", icon: Split, label: t("member.nav.shared") },
    { to: "/member/settings", icon: Settings, label: t("member.nav.more") },
  ];

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
