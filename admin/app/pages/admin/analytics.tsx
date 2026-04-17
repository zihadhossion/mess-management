import { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Receipt,
  Activity,
  Layers,
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchPlatformStats } from "~/redux/features/adminSlice";
import {
  getUserGrowth,
  getMessTrend,
} from "~/services/httpServices/adminService";
import type { TrendPoint } from "~/types/admin.d";

const PERIOD_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 3 months" },
  { value: "custom", label: "Custom" },
];

const CARD = "bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)]";

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display font-bold text-[18px] text-[#2C2F1E]">{title}</h2>
      {subtitle && <p className="text-[13px] text-[#6B7550] mt-0.5">{subtitle}</p>}
    </div>
  );
}

function MetricPair({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex flex-col">
      <span className="font-display font-bold text-[24px] text-[#2C2F1E]">{value ?? "—"}</span>
      <span className="text-[12px] text-[#6B7550] mt-0.5">{label}</span>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const dispatch = useAppDispatch();
  const { stats, isLoading } = useAppSelector((s) => s.admin);

  const [period, setPeriod] = useState("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [userGrowth, setUserGrowth] = useState<TrendPoint[]>([]);
  const [messTrend, setMessTrend] = useState<TrendPoint[]>([]);
  const [chartsLoading, setChartsLoading] = useState(false);

  const effectivePeriod = period === "custom" ? (customFrom && customTo ? `custom&from=${customFrom}&to=${customTo}` : null) : period;

  const loadCharts = useCallback(() => {
    if (!effectivePeriod) return;
    setChartsLoading(true);
    Promise.all([
      getUserGrowth(effectivePeriod).then((r) => r.data.data).catch(() => []),
      getMessTrend(effectivePeriod).then((r) => r.data.data).catch(() => []),
    ]).then(([growth, trend]) => {
      setUserGrowth(growth);
      setMessTrend(trend);
      setChartsLoading(false);
    });
  }, [effectivePeriod]);

  useEffect(() => {
    dispatch(fetchPlatformStats());
  }, [dispatch]);

  useEffect(() => {
    loadCharts();
  }, [loadCharts]);

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

  const roleData = [
    { name: "Members", value: stats?.memberCount ?? 0, color: "#626F47" },
    { name: "Managers", value: stats?.managerCount ?? 0, color: "#A4B465" },
    { name: "Admins", value: stats?.adminCount ?? 0, color: "#F0BB78" },
  ];

  const totalRoles = roleData.reduce((s, r) => s + r.value, 0);

  const tooltipStyle = {
    contentStyle: {
      borderRadius: "10px",
      border: "1px solid #E8E0D0",
      fontSize: "13px",
    },
    cursor: { fill: "rgba(98,111,71,0.06)" },
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#2C2F1E]">Analytics</h1>
          <p className="text-base text-[#6B7550]">Platform performance overview</p>
        </div>

        {/* Period filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-white border border-[#D9CEB4] rounded-[10px] overflow-hidden">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                  period === opt.value
                    ? "bg-[#626F47] text-white"
                    : "text-[#6B7550] hover:bg-[#FAF7F0]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {period === "custom" && (
            <>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="border border-[#D9CEB4] rounded-[10px] px-3 py-1.5 text-[13px] text-[#2C2F1E] outline-none focus:border-[#626F47]"
              />
              <span className="text-[#6B7550] text-[13px]">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="border border-[#D9CEB4] rounded-[10px] px-3 py-1.5 text-[13px] text-[#2C2F1E] outline-none focus:border-[#626F47]"
              />
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">

          {/* ── Section 1: Overview Stats ─────────────────────────────── */}
          <section>
            <SectionHeading title="Overview" subtitle="Platform-wide totals at a glance" />
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "bg-blue-50 text-blue-600" },
                { label: "Total Messes", value: stats?.totalMesses, icon: Building2, color: "bg-[rgba(98,111,71,0.1)] text-[#626F47]" },
                { label: "Active Members", value: stats?.activeMembers, icon: TrendingUp, color: "bg-amber-50 text-amber-600" },
                { label: "Pending Requests", value: stats?.pendingRequests, icon: BarChart3, color: "bg-purple-50 text-purple-600" },
                { label: "Invoices This Month", value: stats?.totalInvoicesThisMonth, icon: Receipt, color: "bg-green-50 text-green-600" },
                { label: "Revenue This Month", value: stats?.revenueThisMonth ? `৳${stats.revenueThisMonth.toLocaleString()}` : null, icon: DollarSign, color: "bg-[rgba(240,187,120,0.2)] text-amber-700" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className={CARD}>
                  <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center mb-3 ${color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="font-display font-bold text-[28px] text-[#2C2F1E]">{value ?? "—"}</div>
                  <div className="text-sm text-[#6B7550] mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 2: User Analytics ─────────────────────────────── */}
          <section>
            <SectionHeading title="User Analytics" subtitle="Growth trends and role distribution" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* User Growth Line Chart */}
              <div className={CARD}>
                <div className="font-semibold text-base text-[#2C2F1E] mb-1">User Growth Trend</div>
                <p className="text-xs text-[#6B7550] mb-4">Daily/weekly new registrations</p>
                {chartsLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-6 h-6 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : userGrowth.length === 0 ? (
                  <div className="flex justify-center items-center h-[200px] text-[13px] text-[#A09070]">No data for this period</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={userGrowth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EAD8" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7550" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#6B7550" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip {...tooltipStyle} />
                      <Line type="monotone" dataKey="count" stroke="#626F47" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Role Distribution Pie */}
              <div className={CARD}>
                <div className="font-semibold text-base text-[#2C2F1E] mb-1">User Distribution by Role</div>
                <p className="text-xs text-[#6B7550] mb-4">Percentage breakdown</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={roleData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {roleData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "10px", border: "1px solid #E8E0D0", fontSize: "13px" }}
                      formatter={(value: number) => [`${value} (${totalRoles ? Math.round((value / totalRoles) * 100) : 0}%)`, ""]}
                    />
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* User Status Bar Chart */}
              <div className={CARD}>
                <div className="font-semibold text-base text-[#2C2F1E] mb-1">Users by Status</div>
                <p className="text-xs text-[#6B7550] mb-4">Distribution across account states</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={usersBarData} barCategoryGap="35%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EAD8" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7550" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#6B7550" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {usersBarData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* User Metrics */}
              <div className={CARD}>
                <div className="font-semibold text-base text-[#2C2F1E] mb-4">User Metrics</div>
                <div className="grid grid-cols-2 gap-6">
                  <MetricPair label="New Today" value={stats?.newRegistrationsToday} />
                  <MetricPair label="New This Week" value={stats?.newRegistrationsThisWeek} />
                  <MetricPair label="New This Month" value={stats?.newRegistrationsThisMonth} />
                  <MetricPair
                    label="Avg Users / Mess"
                    value={
                      stats?.totalMesses && stats?.totalUsers
                        ? (stats.totalUsers / stats.totalMesses).toFixed(1)
                        : "—"
                    }
                  />
                </div>
              </div>

            </div>
          </section>

          {/* ── Section 3: Mess Analytics ─────────────────────────────── */}
          <section>
            <SectionHeading title="Mess Analytics" subtitle="Mess creation trends and status breakdown" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Mess Trend Bar Chart */}
              <div className={CARD}>
                <div className="font-semibold text-base text-[#2C2F1E] mb-1">Mess Creation Trend</div>
                <p className="text-xs text-[#6B7550] mb-4">New messes created over time</p>
                {chartsLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-6 h-6 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messTrend.length === 0 ? (
                  <div className="flex justify-center items-center h-[200px] text-[13px] text-[#A09070]">No data for this period</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={messTrend} barCategoryGap="35%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EAD8" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7550" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#6B7550" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip {...tooltipStyle} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#A4B465" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Mess Status Chart */}
              <div className={CARD}>
                <div className="font-semibold text-base text-[#2C2F1E] mb-1">Messes by Status</div>
                <p className="text-xs text-[#6B7550] mb-4">Distribution across mess states</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={messesBarData} barCategoryGap="35%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EAD8" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7550" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#6B7550" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {messesBarData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Mess Metrics */}
              <div className={`${CARD} lg:col-span-2`}>
                <div className="font-semibold text-base text-[#2C2F1E] mb-4">Mess Metrics</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <MetricPair label="New This Week" value={stats?.newMessesThisWeek} />
                  <MetricPair label="New This Month" value={stats?.newMessesThisMonth} />
                  <MetricPair label="Pending Deletion" value={stats?.pendingDeletionRequests} />
                  <MetricPair
                    label="Avg Members / Mess"
                    value={
                      stats?.totalMesses && stats?.activeMembers
                        ? (stats.activeMembers / stats.totalMesses).toFixed(1)
                        : "—"
                    }
                  />
                </div>
              </div>

            </div>
          </section>

          {/* ── Section 4: Financial Analytics ───────────────────────── */}
          <section>
            <SectionHeading title="Financial Analytics" subtitle="Revenue, invoices and billing overview" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Revenue Banner */}
              <div className="bg-gradient-to-r from-[#626F47] to-[#4a5536] rounded-[16px] p-6 text-white shadow-[0_4px_16px_rgba(74,60,30,0.15)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-1">Revenue This Month</p>
                    <div className="font-display font-bold text-[36px]">
                      ৳{(stats?.revenueThisMonth ?? 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-white/70 mt-1">
                      From {stats?.totalInvoicesThisMonth ?? 0} invoice{(stats?.totalInvoicesThisMonth ?? 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-[16px] bg-white/15 flex items-center justify-center">
                    <DollarSign size={32} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Shared Bills */}
              <div className={CARD}>
                <div className="font-semibold text-base text-[#2C2F1E] mb-4">Shared Bills</div>
                <div className="grid grid-cols-2 gap-6">
                  <MetricPair label="Total Invoices (Shared Bills)" value={stats?.totalSharedBillInvoices} />
                  <MetricPair label="Invoices This Month" value={stats?.totalInvoicesThisMonth} />
                </div>
              </div>

            </div>
          </section>

          {/* ── Section 5: Engagement & System Usage ─────────────────── */}
          <section>
            <SectionHeading title="Engagement & System Usage" subtitle="Adoption and participation metrics" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Active Users", value: stats?.activeUsers, icon: Activity, color: "bg-green-50 text-green-600" },
                { label: "Members", value: stats?.memberCount, icon: Users, color: "bg-blue-50 text-blue-600" },
                { label: "Managers", value: stats?.managerCount, icon: Layers, color: "bg-[rgba(98,111,71,0.1)] text-[#626F47]" },
                { label: "Admins", value: stats?.adminCount, icon: BarChart3, color: "bg-amber-50 text-amber-600" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className={CARD}>
                  <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center mb-3 ${color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="font-display font-bold text-[28px] text-[#2C2F1E]">{value ?? "—"}</div>
                  <div className="text-sm text-[#6B7550] mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
