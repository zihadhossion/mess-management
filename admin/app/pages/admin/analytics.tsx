import { useEffect } from "react";
import {
  BarChart3,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Receipt,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
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
      icon: Receipt,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Revenue This Month",
      value: stats?.revenueThisMonth
        ? `৳${stats.revenueThisMonth.toLocaleString()}`
        : null,
      icon: DollarSign,
      color: "bg-[rgba(240,187,120,0.2)] text-amber-700",
    },
  ];

  const usersBarData = [
    { name: "Active", value: stats?.activeUsers ?? 0, color: "#22c55e" },
    { name: "Suspended", value: stats?.suspendedUsers ?? 0, color: "#f59e0b" },
    { name: "Banned", value: stats?.bannedUsers ?? 0, color: "#ef4444" },
  ];

  const messesBarData = [
    { name: "Active", value: stats?.activeMesses ?? 0, color: "#22c55e" },
    { name: "Pending", value: stats?.pendingMesses ?? 0, color: "#f59e0b" },
    { name: "Deletion Req.", value: stats?.pendingDeletionRequests ?? 0, color: "#ef4444" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-[26px] text-[#2C2F1E]">
          Analytics
        </h1>
        <p className="text-base text-[#6B7550]">Platform performance overview</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
                <div className="font-display font-bold text-[28px] text-[#2C2F1E]">
                  {value ?? "—"}
                </div>
                <div className="text-sm text-[#6B7550] mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Bar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Users Status */}
            <div className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
              <div className="font-semibold text-base text-[#2C2F1E] mb-1">
                Users by Status
              </div>
              <p className="text-xs text-[#6B7550] mb-4">
                Distribution across account states
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={usersBarData}
                  barCategoryGap="35%"
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F0EAD8"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6B7550" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6B7550" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(98,111,71,0.06)" }}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #E8E0D0",
                      fontSize: "13px",
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {usersBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Messes Status */}
            <div className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
              <div className="font-semibold text-base text-[#2C2F1E] mb-1">
                Messes by Status
              </div>
              <p className="text-xs text-[#6B7550] mb-4">
                Distribution across mess states
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={messesBarData}
                  barCategoryGap="35%"
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F0EAD8"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6B7550" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6B7550" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(98,111,71,0.06)" }}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #E8E0D0",
                      fontSize: "13px",
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {messesBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="mt-4 bg-gradient-to-r from-[#626F47] to-[#4a5536] rounded-[16px] p-6 text-white shadow-[0_4px_16px_rgba(74,60,30,0.15)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70 mb-1">Revenue This Month</p>
                <div className="font-display font-bold text-[36px]">
                  ৳{(stats?.revenueThisMonth ?? 0).toLocaleString()}
                </div>
                <p className="text-sm text-white/70 mt-1">
                  From {stats?.totalInvoicesThisMonth ?? 0} invoice
                  {(stats?.totalInvoicesThisMonth ?? 0) !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="w-16 h-16 rounded-[16px] bg-white/15 flex items-center justify-center">
                <DollarSign size={32} className="text-white" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
