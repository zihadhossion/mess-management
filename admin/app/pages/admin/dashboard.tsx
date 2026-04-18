import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Users,
  Building2,
  TrendingUp,
  AlertCircle,
  UserCheck,
  UserCog,
  Shield,
  CalendarPlus,
  Receipt,
  Clock,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import {
  fetchPlatformStats,
  fetchPendingMessRequests,
} from "~/redux/features/adminSlice";
import {
  getUserGrowth,
  getMessTrend,
  getRecentActivity,
} from "~/services/httpServices/adminService";
import type { TrendPoint, RecentActivity } from "~/types/admin.d";

const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "custom", label: "Custom" },
];

const DONUT_COLORS = {
  active: "#22c55e",
  suspended: "#f59e0b",
  banned: "#ef4444",
  pending: "#f59e0b",
  deletion: "#ef4444",
};

const ACTIVITY_TYPE_STYLE: Record<string, string> = {
  registration: "bg-blue-50 text-blue-600",
  mess_created: "bg-[rgba(98,111,71,0.12)] text-[#626F47]",
  deletion_request: "bg-red-50 text-red-600",
  join_request: "bg-amber-50 text-amber-700",
};

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

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
  const chartData = isEmpty ? [{ name: "None", value: 1, color: "#e5e7eb" }] : data;
  return (
    <div className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
      <div className="font-semibold text-base text-[#2C2F1E] mb-4">{label}</div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
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
                formatter={(v, n) => [v, n]}
                contentStyle={{ borderRadius: "10px", border: "1px solid #E8E0D0", fontSize: "13px" }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-display font-bold text-[24px] text-[#2C2F1E]">{total}</span>
          <span className="text-xs text-[#6B7550]">Total</span>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {data.map(({ name, value, color }) => (
          <div key={name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-sm text-[#6B7550]">{name}</span>
            </div>
            <span className="font-semibold text-sm text-[#2C2F1E]">{value ?? "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniLineChart({ data, color = "#626F47" }: { data: TrendPoint[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0EAD8" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7550" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#6B7550" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #E8E0D0", fontSize: "13px" }} />
        <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function MiniBarChart({ data, color = "#626F47" }: { data: TrendPoint[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} barCategoryGap="35%" margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0EAD8" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7550" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#6B7550" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #E8E0D0", fontSize: "13px" }} />
        <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { stats, pendingMessRequests, isLoading } = useAppSelector((s) => s.admin);

  const [period, setPeriod] = useState("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [userGrowth, setUserGrowth] = useState<TrendPoint[]>([]);
  const [messTrend, setMessTrend] = useState<TrendPoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    dispatch(fetchPlatformStats(period !== "custom" ? period : undefined));
    dispatch(fetchPendingMessRequests());
    getUserGrowth(period).then((r) => setUserGrowth(r.data.data ?? [])).catch(() => setUserGrowth([]));
    getMessTrend(period).then((r) => setMessTrend(r.data.data ?? [])).catch(() => setMessTrend([]));
    getRecentActivity().then((r) => setRecentActivity(r.data.data ?? [])).catch(() => setRecentActivity([]));
  }, [dispatch, period]);

  const hasPendingRequests = (stats?.pendingRequests ?? 0) > 0;

  const primaryCards = [
    { label: "Total Users",     value: stats?.totalUsers,    icon: Users,       color: "text-blue-600 bg-blue-50" },
    { label: "Total Messes",    value: stats?.totalMesses,   icon: Building2,   color: "text-[#626F47] bg-[rgba(98,111,71,0.1)]" },
    { label: "Active Members",  value: stats?.activeMembers, icon: TrendingUp,  color: "text-amber-600 bg-amber-50" },
    { label: "Pending Requests",value: stats?.pendingRequests,icon: AlertCircle,color: hasPendingRequests ? "text-red-500 bg-red-50" : "text-gray-400 bg-gray-100" },
  ];

  const roleCards = [
    { label: "Members",  value: stats?.memberCount,  icon: UserCheck, color: "text-blue-600 bg-blue-50" },
    { label: "Managers", value: stats?.managerCount, icon: UserCog,   color: "text-[#626F47] bg-[rgba(98,111,71,0.1)]" },
    { label: "Admins",   value: stats?.adminCount,   icon: Shield,    color: "text-purple-600 bg-purple-50" },
  ];

  const registrationCards = [
    { label: "New Today",       value: stats?.newRegistrationsToday },
    { label: "New This Week",   value: stats?.newRegistrationsThisWeek },
    { label: "New This Month",  value: stats?.newRegistrationsThisMonth },
    { label: "New Messes (Week)", value: stats?.newMessesThisWeek },
    { label: "New Messes (Month)", value: stats?.newMessesThisMonth },
    { label: "Shared Bill Invoices", value: stats?.totalSharedBillInvoices },
  ];

  const usersChartData = [
    { name: "Active",    value: stats?.activeUsers ?? 0,    color: DONUT_COLORS.active },
    { name: "Suspended", value: stats?.suspendedUsers ?? 0, color: DONUT_COLORS.suspended },
    { name: "Banned",    value: stats?.bannedUsers ?? 0,    color: DONUT_COLORS.banned },
  ];

  const messesChartData = [
    { name: "Active",            value: stats?.activeMesses ?? 0,           color: DONUT_COLORS.active },
    { name: "Pending Approval",  value: stats?.pendingMesses ?? 0,          color: DONUT_COLORS.pending },
    { name: "Deletion Requests", value: stats?.pendingDeletionRequests ?? 0, color: DONUT_COLORS.deletion },
  ];

  return (
    <div className="p-6">
      {/* Header + Period filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#2C2F1E]">Dashboard</h1>
          <p className="text-base text-[#6B7550]">Platform overview</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-[9px] text-[14px] font-semibold transition-colors ${
                period === opt.value
                  ? "bg-[#626F47] text-[#F5ECD5]"
                  : "bg-white border border-[#D9CEB4] text-[#6B7550] hover:bg-[#FAF7F0]"
              }`}
            >
              {opt.label}
            </button>
          ))}
          {period === "custom" && (
            <div className="flex gap-2 items-center">
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
                className="border border-[#D9CEB4] rounded-[9px] px-2 py-1.5 text-[14px] text-[#2C2F1E] outline-none focus:border-[#626F47]" />
              <span className="text-[#6B7550] text-sm">to</span>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
                className="border border-[#D9CEB4] rounded-[9px] px-2 py-1.5 text-[14px] text-[#2C2F1E] outline-none focus:border-[#626F47]" />
            </div>
          )}
        </div>
      </div>

      {/* Primary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {primaryCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
            <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <div className="font-display font-bold text-[28px] text-[#2C2F1E]">{isLoading ? "—" : (value ?? "—")}</div>
            <div className="text-sm text-[#6B7550] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Role breakdown + Registration trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Role breakdown */}
        <div className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
          <div className="font-semibold text-base text-[#2C2F1E] mb-4">Users by Role</div>
          <div className="grid grid-cols-3 gap-3">
            {roleCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[#FAF7F0] rounded-[12px] p-4 text-center">
                <div className={`w-9 h-9 rounded-[9px] flex items-center justify-center mx-auto mb-2 ${color}`}>
                  <Icon size={17} />
                </div>
                <div className="font-display font-bold text-[22px] text-[#2C2F1E]">{isLoading ? "—" : (value ?? "—")}</div>
                <div className="text-[13px] text-[#6B7550]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Registration metrics */}
        <div className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
          <div className="font-semibold text-base text-[#2C2F1E] mb-4">Registration & Activity</div>
          <div className="grid grid-cols-2 gap-3">
            {registrationCards.map(({ label, value }) => (
              <div key={label} className="bg-[#FAF7F0] rounded-[10px] px-3 py-2.5">
                <div className="font-display font-bold text-[20px] text-[#2C2F1E]">{isLoading ? "—" : (value ?? "—")}</div>
                <div className="text-[12px] text-[#6B7550] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending alert */}
      {pendingMessRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-[16px] p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0" />
            <div>
              <div className="font-semibold text-base text-amber-800">
                {pendingMessRequests.length} pending mess request{pendingMessRequests.length !== 1 ? "s" : ""}
              </div>
              <div className="text-sm text-amber-700">Review and approve or reject</div>
            </div>
          </div>
          <Link to="/mess-requests" className="bg-amber-600 text-white font-semibold text-[15px] px-4 py-2 rounded-[10px]">
            Review
          </Link>
        </div>
      )}

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
          <div className="font-semibold text-base text-[#2C2F1E] mb-1">User Growth Trend</div>
          <p className="text-xs text-[#6B7550] mb-3">New registrations over time</p>
          {userGrowth.length > 0 ? (
            <MiniLineChart data={userGrowth} color="#626F47" />
          ) : (
            <div className="flex items-center justify-center h-[120px] text-[14px] text-[#A09070]">
              No growth data available
            </div>
          )}
        </div>
        <div className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
          <div className="font-semibold text-base text-[#2C2F1E] mb-1">Mess Creation Trend</div>
          <p className="text-xs text-[#6B7550] mb-3">New messes created over time</p>
          {messTrend.length > 0 ? (
            <MiniBarChart data={messTrend} color="#A4B465" />
          ) : (
            <div className="flex items-center justify-center h-[120px] text-[14px] text-[#A09070]">
              No trend data available
            </div>
          )}
        </div>
      </div>

      {/* Donut charts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <DonutChart data={usersChartData} total={stats?.totalUsers ?? 0} label="Users Breakdown" />
        <DonutChart data={messesChartData} total={stats?.totalMesses ?? 0} label="Messes Breakdown" />
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
        <div className="font-semibold text-base text-[#2C2F1E] mb-4">Recent Activity</div>
        {recentActivity.length === 0 ? (
          <div className="flex items-center gap-2 text-[14px] text-[#A09070] py-4 justify-center">
            <Clock size={16} />
            <span>No recent activity</span>
          </div>
        ) : (
          <div className="space-y-2">
            {recentActivity.slice(0, 8).map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 py-2 border-b border-[#F0EBE0] last:border-0">
                <div className="flex items-start gap-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 mt-0.5 ${ACTIVITY_TYPE_STYLE[item.type] ?? "bg-gray-100 text-gray-600"}`}>
                    {item.type.replace("_", " ")}
                  </span>
                  <span className="text-[14px] text-[#2C2F1E]">{item.description}</span>
                </div>
                <span className="text-[13px] text-[#A09070] shrink-0">{formatRelative(item.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
