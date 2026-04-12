import { useEffect } from "react";
import { Link } from "react-router";
import {
  Users,
  Building2,
  FileText,
  BarChart3,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import {
  fetchPlatformStats,
  fetchPendingMessRequests,
} from "~/redux/features/adminSlice";

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { stats, pendingMessRequests, isLoading } = useAppSelector(
    (s) => s.admin,
  );

  useEffect(() => {
    dispatch(fetchPlatformStats());
    dispatch(fetchPendingMessRequests());
  }, [dispatch]);

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? "—",
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Total Messes",
      value: stats?.totalMesses ?? "—",
      icon: Building2,
      color: "text-[#626F47] bg-[rgba(98,111,71,0.1)]",
    },
    {
      label: "Active Members",
      value: stats?.activeMembers ?? "—",
      icon: TrendingUp,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Pending Requests",
      value: stats?.pendingRequests ?? "—",
      icon: AlertCircle,
      color: "text-red-500 bg-red-50",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-[24px] text-[#2C2F1E]">
          Dashboard
        </h1>
        <p className="text-[14px] text-[#6B7550]">Platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)]"
          >
            <div
              className={`w-10 h-10 rounded-[10px] flex items-center justify-center mb-3 ${color}`}
            >
              <Icon size={20} />
            </div>
            <div className="font-display font-bold text-[26px] text-[#2C2F1E]">
              {isLoading ? "—" : value}
            </div>
            <div className="text-[12px] text-[#6B7550] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Pending mess requests alert */}
      {pendingMessRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-[16px] p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0" />
            <div>
              <div className="font-semibold text-[14px] text-amber-800">
                {pendingMessRequests.length} pending mess request
                {pendingMessRequests.length !== 1 ? "s" : ""}
              </div>
              <div className="text-[12px] text-amber-700">
                Review and approve or reject
              </div>
            </div>
          </div>
          <Link
            to="/mess-requests"
            className="bg-amber-600 text-white font-semibold text-[13px] px-4 py-2 rounded-[10px]"
          >
            Review
          </Link>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            to: "/users",
            icon: Users,
            label: "Manage Users",
            sub: "View and manage all users",
          },
          {
            to: "/messes",
            icon: Building2,
            label: "Manage Messes",
            sub: "View all registered messes",
          },
          {
            to: "/mess-requests",
            icon: FileText,
            label: "Mess Requests",
            sub: "Approve/reject creation requests",
          },
          {
            to: "/analytics",
            icon: BarChart3,
            label: "Analytics",
            sub: "Platform-wide stats",
          },
        ].map(({ to, icon: Icon, label, sub }) => (
          <Link
            key={to}
            to={to}
            className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 flex items-start gap-3 shadow-[0_2px_8px_rgba(74,60,30,0.06)] hover:border-[#626F47] transition-colors"
          >
            <div className="w-10 h-10 bg-[rgba(98,111,71,0.1)] rounded-[10px] flex items-center justify-center shrink-0">
              <Icon size={20} className="text-[#626F47]" />
            </div>
            <div>
              <div className="font-semibold text-[14px] text-[#2C2F1E]">
                {label}
              </div>
              <div className="text-[12px] text-[#6B7550] mt-0.5">{sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
