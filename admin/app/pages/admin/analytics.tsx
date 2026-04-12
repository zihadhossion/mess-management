import { useEffect } from "react";
import {
  BarChart3,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchPlatformStats } from "~/redux/features/adminSlice";

export default function AdminAnalyticsPage() {
  const dispatch = useAppDispatch();
  const { stats, isLoading } = useAppSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchPlatformStats());
  }, [dispatch]);

  const statItems = [
    {
      label: "Total Users",
      value: stats?.totalUsers,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Messes",
      value: stats?.totalMesses,
      icon: Building2,
      color: "bg-[rgba(98,111,71,0.1)] text-[#626F47]",
    },
    {
      label: "Active Members",
      value: stats?.activeMembers,
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Pending Requests",
      value: stats?.pendingRequests,
      icon: BarChart3,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Invoices This Month",
      value: stats?.totalInvoicesThisMonth,
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Revenue This Month",
      value: stats?.revenueThisMonth
        ? `৳${stats.revenueThisMonth.toLocaleString()}`
        : null,
      icon: TrendingUp,
      color: "bg-[rgba(240,187,120,0.2)] text-amber-700",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-[24px] text-[#2C2F1E]">
          Analytics
        </h1>
        <p className="text-[14px] text-[#6B7550]">
          Platform performance overview
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statItems.map(({ label, value, icon: Icon, color }) => (
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
                {value ?? "—"}
              </div>
              <div className="text-[12px] text-[#6B7550] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
