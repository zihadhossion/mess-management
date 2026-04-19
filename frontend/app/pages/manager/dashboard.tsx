import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Users,
  CreditCard,
  Bell,
  UtensilsCrossed,
  ChevronRight,
  TrendingUp,
  UserPlus,
  Split,
  DollarSign,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchMembers } from "~/redux/features/memberSlice";
import { get } from "~/services/httpMethods/get";
import { useAuth } from "~/hooks/useAuth";
import type { MonthlyBillSummary } from "~/types/billing.d";
import type { JoinRequest } from "~/types/mess.d";
import type { SharedBillEntry } from "~/types/shared-bill.d";

export default function ManagerDashboard() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { user } = useAuth();
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const { members } = useAppSelector((s) => s.member);

  const [billSummary, setBillSummary] = useState<MonthlyBillSummary | null>(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [sharedBillTotal, setSharedBillTotal] = useState(0);
  const [sharedBillEntries, setSharedBillEntries] = useState(0);

  const monthInt = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  useEffect(() => {
    dispatch(fetchMembers());
  }, [dispatch]);

  useEffect(() => {
    if (!messId) return;

    // Billing summary
    get<{ data: MonthlyBillSummary }>(`/messes/${messId}/billing/summary?month=${monthInt}&year=${year}`)
      .then((res) => setBillSummary(res.data))
      .catch(() => {});

    // Pending join requests
    get<{ data: JoinRequest[] }>(`/messes/${messId}/join-requests`)
      .then((res) => {
        const pending = res.data.filter((r) => r.status === "pending");
        setPendingRequests(pending.length);
      })
      .catch(() => {});

    // Shared bills total
    get<{ data: SharedBillEntry[] }>(`/messes/${messId}/shared-bills/entries?month=${monthInt}&year=${year}`)
      .then((res) => {
        const total = res.data.reduce((sum, e) => sum + (e.totalAmount ?? e.amount ?? 0), 0);
        setSharedBillTotal(total);
        setSharedBillEntries(res.data.length);
      })
      .catch(() => {});
  }, [messId]);

  const activeMembers = members.filter((m) => m.isActive).length;

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="bg-[#626F47] px-5 pt-3 pb-7 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="absolute -bottom-10 -left-5 w-[100px] h-[100px] bg-[rgba(164,180,101,0.12)] rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[12px] text-[rgba(245,236,213,0.72)]">
                {t("manager.dashboard.title")}
              </p>
              <p className="font-display font-bold text-[18px] text-[#F5ECD5]">
                {user?.name ?? "—"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/manager/notifications">
                <div className="w-9 h-9 bg-[rgba(245,236,213,0.12)] rounded-full flex items-center justify-center">
                  <Bell size={18} className="text-[#F5ECD5]" />
                </div>
              </Link>
              <div className="w-10 h-10 rounded-full bg-[#F0BB78] flex items-center justify-center font-display font-bold text-[16px] text-[#2C2F1E]">
                {user?.name?.[0]?.toUpperCase() ?? "M"}
              </div>
            </div>
          </div>
          {user?.messName && (
            <p className="text-[12px] text-[rgba(245,236,213,0.65)]">
              {user.messName} · {user.messCode}
            </p>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="mx-4 -mt-3.5 relative z-10 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[12px] p-4 shadow-[0_4px_16px_rgba(74,60,30,0.1)]">
        <div className="flex items-center justify-between mb-3">
          <span className="font-display font-bold text-[14px] text-[#2C2F1E]">
            {t("manager.dashboard.overview")}
          </span>
          <TrendingUp size={16} className="text-[#626F47]" />
        </div>
        <div className="grid grid-cols-2 gap-2.5 text-center">
          <div>
            <div className="font-display font-bold text-[22px] text-[#626F47]">{activeMembers}</div>
            <div className="text-[10px] text-[#6B7550] uppercase tracking-[0.06em] mt-0.5">
              {t("manager.dashboard.members")}
            </div>
          </div>
          <div>
            <div className="font-display font-bold text-[22px] text-[#2C2F1E]">
              {pendingRequests > 0 ? (
                <span className="text-amber-600">{pendingRequests}</span>
              ) : (
                "0"
              )}
            </div>
            <div className="text-[10px] text-[#6B7550] uppercase tracking-[0.06em] mt-0.5">
              {t("manager.dashboard.pendingJoinRequests")}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Cost Tracking Card */}
        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[rgba(98,111,71,0.1)] rounded-[8px] flex items-center justify-center">
              <DollarSign size={16} className="text-[#626F47]" />
            </div>
            <span className="font-semibold text-[14px] text-[#2C2F1E]">
              {t("manager.dashboard.costTracking")}
            </span>
            <Link to="/manager/meal-billing" className="ml-auto text-[12px] font-semibold text-[#626F47]">
              {t("manager.dashboard.viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-display font-bold text-[18px] text-[#626F47]">
                ৳{billSummary ? Number(billSummary.totalCost).toLocaleString() : "—"}
              </div>
              <div className="text-[10px] text-[#6B7550] uppercase tracking-[0.05em] mt-0.5">
                {t("manager.dashboard.runningTotal")}
              </div>
            </div>
            <div>
              <div className="font-display font-bold text-[18px] text-[#2C2F1E]">
                ৳{billSummary ? Number(billSummary.costPerMeal).toFixed(1) : "—"}
              </div>
              <div className="text-[10px] text-[#6B7550] uppercase tracking-[0.05em] mt-0.5">
                {t("manager.dashboard.costPerMeal")}
              </div>
            </div>
            <div>
              <div className="font-display font-bold text-[18px] text-[#2C2F1E]">
                {billSummary ? billSummary.totalPortions : "—"}
              </div>
              <div className="text-[10px] text-[#6B7550] uppercase tracking-[0.05em] mt-0.5">
                {t("manager.dashboard.totalPortions")}
              </div>
            </div>
          </div>
        </div>

        {/* Shared Bills Overview */}
        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[rgba(98,111,71,0.1)] rounded-[8px] flex items-center justify-center">
              <Split size={16} className="text-[#626F47]" />
            </div>
            <span className="font-semibold text-[14px] text-[#2C2F1E]">
              {t("manager.dashboard.sharedBillsOverview")}
            </span>
            <Link to="/manager/shared-bills" className="ml-auto text-[12px] font-semibold text-[#626F47]">
              {t("manager.dashboard.viewAll")}
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-[18px] text-[#626F47]">
              ৳{sharedBillTotal.toLocaleString()}
            </span>
            <span className="text-[12px] text-[#6B7550]">
              {t("manager.dashboard.sharedBillsEntries", { count: sharedBillEntries })}
            </span>
          </div>
        </div>

        {/* Pending Actions */}
        {pendingRequests > 0 && (
          <Link
            to="/manager/members/join-requests"
            className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-[14px] p-4"
          >
            <div className="w-9 h-9 bg-amber-100 rounded-[10px] flex items-center justify-center shrink-0">
              <UserPlus size={18} className="text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[14px] text-[#2C2F1E]">
                {t("manager.dashboard.pendingJoinRequests")}
              </div>
              <div className="text-[12px] text-amber-700">
                {t("manager.dashboard.pendingRequestsCount", { count: pendingRequests })}
              </div>
            </div>
            <ChevronRight size={16} className="text-amber-600 shrink-0" />
          </Link>
        )}

        {/* Quick actions */}
        <div>
          <p className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.08em] mb-3">
            {t("manager.dashboard.quickActions")}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { to: "/manager/menu", icon: UtensilsCrossed, label: t("manager.dashboard.manageMenu"), sub: t("manager.dashboard.manageMenuDesc") },
              { to: "/manager/members", icon: Users, label: t("manager.dashboard.membersAction"), sub: t("manager.dashboard.membersDesc") },
              { to: "/manager/meal-billing", icon: CreditCard, label: t("manager.dashboard.mealBilling"), sub: t("manager.dashboard.mealBillingDesc") },
              { to: "/manager/shared-bills", icon: Split, label: t("manager.dashboard.sharedBills"), sub: t("manager.dashboard.sharedBillsDesc") },
            ].map(({ to, icon: Icon, label, sub }) => (
              <Link
                key={to}
                to={to}
                className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[12px] p-3.5 flex items-center gap-3 shadow-[0_1px_4px_rgba(74,60,30,0.06)]"
              >
                <div className="w-9 h-9 bg-[rgba(98,111,71,0.1)] rounded-[10px] flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-[#626F47]" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[13px] text-[#2C2F1E]">{label}</div>
                  <div className="text-[10px] text-[#6B7550]">{sub}</div>
                </div>
                <ChevronRight size={14} className="text-[#A09070] ml-auto shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Members preview */}
        {members.length > 0 && (
          <div className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.08em]">
                {t("manager.dashboard.recentMembers")}
              </p>
              <Link to="/manager/members" className="text-[12px] font-semibold text-[#626F47]">
                {t("manager.dashboard.seeAll")}
              </Link>
            </div>
            {members.slice(0, 3).map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[12px] px-4 py-3 mb-2"
              >
                <div className="w-9 h-9 rounded-full bg-[#F0BB78] flex items-center justify-center font-bold text-[14px] text-[#2C2F1E]">
                  {m.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px] text-[#2C2F1E]">{m.name}</div>
                  <div className="text-[12px] text-[#6B7550]">{m.email}</div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.isActive ? "bg-[rgba(98,111,71,0.12)] text-[#626F47]" : "bg-[#F0F0E8] text-[#A09070]"}`}
                >
                  {m.isActive ? t("manager.dashboard.active") : t("manager.dashboard.inactive")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
