import { useEffect } from "react";
import { Link } from "react-router";
import { Users, Building2, TrendingUp, AlertCircle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import {
  fetchPlatformStats,
  fetchPendingMessRequests,
} from "~/redux/features/adminSlice";

const DONUT_COLORS = {
  active: "#22c55e",
  suspended: "#f59e0b",
  banned: "#ef4444",
  pending: "#f59e0b",
  deletion: "#ef4444",
};

function DonutChart({
  data,
  total,
  label,
}: {
  data: { name: string; value: number; color: string }[];
  total: number;
  label: string;
}) {
  const isEmpty = total === 0;
  const chartData = isEmpty
    ? [{ name: "None", value: 1, color: "#e5e7eb" }]
    : data;

  return (
    <div className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
      <div className="font-semibold text-base text-[#2C2F1E] mb-4">{label}</div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={isEmpty ? 0 : 3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            {!isEmpty && (
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #E8E0D0",
                  fontSize: "13px",
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-display font-bold text-[26px] text-[#2C2F1E]">
            {total}
          </span>
          <span className="text-xs text-[#6B7550]">Total</span>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {data.map(({ name, value, color }) => (
          <div key={name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-[#6B7550]">{name}</span>
            </div>
            <span className="font-semibold text-sm text-[#2C2F1E]">
              {value ?? "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { stats, pendingMessRequests, isLoading } = useAppSelector(
    (s) => s.admin,
  );

  useEffect(() => {
    dispatch(fetchPlatformStats());
    dispatch(fetchPendingMessRequests());
  }, [dispatch]);

  const hasPendingRequests = (stats?.pendingRequests ?? 0) > 0;

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
      color: hasPendingRequests
        ? "text-red-500 bg-red-50"
        : "text-gray-400 bg-gray-100",
    },
  ];

  const usersChartData = [
    { name: "Active", value: stats?.activeUsers ?? 0, color: DONUT_COLORS.active },
    { name: "Suspended", value: stats?.suspendedUsers ?? 0, color: DONUT_COLORS.suspended },
    { name: "Banned", value: stats?.bannedUsers ?? 0, color: DONUT_COLORS.banned },
  ];

  const messesChartData = [
    { name: "Active", value: stats?.activeMesses ?? 0, color: DONUT_COLORS.active },
    { name: "Pending Approval", value: stats?.pendingMesses ?? 0, color: DONUT_COLORS.pending },
    { name: "Deletion Requests", value: stats?.pendingDeletionRequests ?? 0, color: DONUT_COLORS.deletion },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-[26px] text-[#2C2F1E]">
          Dashboard
        </h1>
        <p className="text-base text-[#6B7550]">Platform overview</p>
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
            <div className="font-display font-bold text-[28px] text-[#2C2F1E]">
              {isLoading ? "—" : value}
            </div>
            <div className="text-sm text-[#6B7550] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Pending mess requests alert */}
      {pendingMessRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-[16px] p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0" />
            <div>
              <div className="font-semibold text-base text-amber-800">
                {pendingMessRequests.length} pending mess request
                {pendingMessRequests.length !== 1 ? "s" : ""}
              </div>
              <div className="text-sm text-amber-700">
                Review and approve or reject
              </div>
            </div>
          </div>
          <Link
            to="/mess-requests"
            className="bg-amber-600 text-white font-semibold text-[15px] px-4 py-2 rounded-[10px]"
          >
            Review
          </Link>
        </div>
      )}

      {/* Breakdown Donut Charts */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)] h-[300px] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <DonutChart
            data={usersChartData}
            total={stats?.totalUsers ?? 0}
            label="Users Breakdown"
          />
          <DonutChart
            data={messesChartData}
            total={stats?.totalMesses ?? 0}
            label="Messes Breakdown"
          />
        </div>
      )}
    </div>
  );
}
