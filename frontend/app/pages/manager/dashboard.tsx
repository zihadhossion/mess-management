import { useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Users,
  CreditCard,
  Bell,
  UtensilsCrossed,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchMembers } from "~/redux/features/memberSlice";
import { fetchMyInvoices } from "~/redux/features/billingSlice";
import { useAuth } from "~/hooks/useAuth";

export default function ManagerDashboard() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { members } = useAppSelector((s) => s.member);
  const { invoices } = useAppSelector((s) => s.billing);

  useEffect(() => {
    dispatch(fetchMembers());
    dispatch(fetchMyInvoices());
  }, [dispatch]);

  const activeMembers = members.filter((m) => m.isActive).length;
  const unpaidCount = invoices.filter((i) => i.status !== "paid").length;

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

      {/* Stats */}
      <div className="mx-4 -mt-3.5 relative z-10 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[12px] p-4 shadow-[0_4px_16px_rgba(74,60,30,0.1)]">
        <div className="flex items-center justify-between mb-3">
          <span className="font-display font-bold text-[14px] text-[#2C2F1E]">
            {t("manager.dashboard.overview")}
          </span>
          <TrendingUp size={16} className="text-[#626F47]" />
        </div>
        <div className="grid grid-cols-3 gap-2.5 text-center">
          {[
            { val: activeMembers, lbl: t("manager.dashboard.members") },
            { val: unpaidCount, lbl: t("manager.dashboard.unpaid") },
            { val: invoices.length, lbl: t("manager.dashboard.invoices") },
          ].map(({ val, lbl }) => (
            <div key={lbl}>
              <div className="font-display font-bold text-[22px] text-[#626F47]">
                {val}
              </div>
              <div className="text-[10px] text-[#6B7550] uppercase tracking-[0.06em] mt-0.5">
                {lbl}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 pt-4">
        <p className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.08em] mb-3">
          {t("manager.dashboard.quickActions")}
        </p>
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {[
            {
              to: "/manager/menu",
              icon: UtensilsCrossed,
              label: t("manager.dashboard.manageMenu"),
              sub: t("manager.dashboard.manageMenuDesc"),
            },
            {
              to: "/manager/members",
              icon: Users,
              label: t("manager.dashboard.membersAction"),
              sub: t("manager.dashboard.membersDesc"),
            },
            {
              to: "/manager/meal-billing",
              icon: CreditCard,
              label: t("manager.dashboard.mealBilling"),
              sub: t("manager.dashboard.mealBillingDesc"),
            },
            {
              to: "/manager/shared-bills",
              icon: CreditCard,
              label: t("manager.dashboard.sharedBills"),
              sub: t("manager.dashboard.sharedBillsDesc"),
            },
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

        {/* Members preview */}
        {members.length > 0 && (
          <div>
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
