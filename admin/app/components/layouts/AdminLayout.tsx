import { Link, NavLink, Outlet } from "react-router";
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  UtensilsCrossed,
  FileText,
  Trash2,
} from "lucide-react";
import { useAuth } from "~/hooks/useAuth";
import { logoutUser } from "~/services/httpServices/authService";
import { cn } from "~/lib/utils";

const navGroups = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    label: "Management",
    items: [
      { to: "/users", icon: Users, label: "Users" },
      { to: "/messes", icon: Building2, label: "Messes" },
      { to: "/mess-requests", icon: FileText, label: "Mess Requests" },
      {
        to: "/deletion-requests",
        icon: Trash2,
        label: "Deletion Requests",
      },
    ],
  },
  {
    label: "Reports",
    items: [{ to: "/analytics", icon: BarChart3, label: "Analytics" }],
  },
  {
    label: "System",
    items: [{ to: "/config", icon: Settings, label: "Configuration" }],
  },
];

export default function AdminLayout() {
  const { signOut } = useAuth();

  async function handleLogout() {
    try {
      await logoutUser();
    } catch {
      /* ignore */
    }
    signOut();
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#F0EBE0" }}>
      {/* Sidebar */}
      <aside className="w-[240px] min-h-screen bg-[#626F47] flex flex-col fixed top-0 left-0 bottom-0 z-10">
        <div className="p-6 pb-5 border-b border-[rgba(245,236,213,0.15)] flex items-center gap-[10px]">
          <Link to="/dashboard" className="flex items-center gap-[10px]">
            <div className="w-9 h-9 bg-[#F0BB78] rounded-[10px] flex items-center justify-center">
              <UtensilsCrossed size={18} className="text-[#2C2F1E]" />
            </div>
            <div>
              <div className="font-display font-bold text-base text-[#F5ECD5] leading-tight">
                MessHub
              </div>
              <div className="text-[11px] text-[rgba(245,236,213,0.6)]">
                Admin Panel
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto no-scrollbar">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="text-[10px] font-semibold text-[rgba(245,236,213,0.45)] uppercase tracking-[0.1em] px-2 mt-[14px] mb-[6px]">
                {group.label}
              </div>
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-[10px] px-[10px] py-[9px] rounded-[9px] text-[13px] font-semibold mb-0.5 transition-colors",
                      isActive
                        ? "bg-[rgba(245,236,213,0.15)] text-[#F5ECD5]"
                        : "text-[rgba(245,236,213,0.75)] hover:bg-[rgba(245,236,213,0.08)]",
                    )
                  }
                >
                  <Icon size={17} className="shrink-0" />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-[rgba(245,236,213,0.15)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-[9px] w-full text-[13px] font-semibold text-[rgba(245,236,213,0.75)] hover:bg-[rgba(245,236,213,0.08)] transition-colors"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-[240px] min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
