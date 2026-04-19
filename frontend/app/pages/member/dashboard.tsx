import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Bell,
  UtensilsCrossed,
  MapPin,
  Calendar,
  Receipt,
  ChevronRight,
  Coffee,
  Sun,
  Moon,
  Split,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchMenuSlots } from "~/redux/features/menuSlice";
import { fetchMyInvoices } from "~/redux/features/billingSlice";
import { get } from "~/services/httpMethods/get";
import { useAuth } from "~/hooks/useAuth";
import type { SharedBillInvoice } from "~/types/shared-bill.d";
import { format } from "date-fns";

export default function MemberDashboard() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { user } = useAuth();
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const { slots, isLoading: menuLoading } = useAppSelector((s) => s.menu);
  const { invoices } = useAppSelector((s) => s.billing);
  const [mySharedInvoice, setMySharedInvoice] = useState<SharedBillInvoice | null>(null);

  const monthInt = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    dispatch(fetchMenuSlots({ startDate: today, endDate: today }));
    dispatch(fetchMyInvoices());
  }, [dispatch]);

  useEffect(() => {
    if (!messId) return;
    get<{ data: SharedBillInvoice[] }>(
      `/messes/${messId}/shared-bills/invoices?month=${monthInt}&year=${year}`
    )
      .then((res) => {
        if (res.data.length > 0) setMySharedInvoice(res.data[0]);
      })
      .catch(() => {});
  }, [messId]);

  const todaySlots = slots.slice(0, 3);
  const latestInvoice = invoices[0] ?? null;
  const bookedCount = slots.filter((s) => s.myBookingStatus === "booked").length;
  const bookingRate = slots.length > 0 ? Math.round((bookedCount / slots.length) * 100) : 0;

  const mealIcon = (type: string) => {
    if (type === "breakfast") return <Coffee size={18} />;
    if (type === "lunch") return <Sun size={18} />;
    return <Moon size={18} />;
  };

  const mealBg = (type: string) => {
    if (type === "breakfast")
      return "bg-[rgba(240,187,120,0.18)] border-[rgba(240,187,120,0.42)]";
    if (type === "lunch")
      return "bg-[rgba(98,111,71,0.08)] border-[rgba(98,111,71,0.22)]";
    return "bg-[rgba(164,180,101,0.10)] border-[rgba(164,180,101,0.28)]";
  };

  const mealIconBg = (type: string) => {
    if (type === "breakfast") return "bg-[#F0BB78] text-[#2C2F1E]";
    if (type === "lunch") return "bg-[#626F47] text-[#F5ECD5]";
    return "bg-[#A4B465] text-white";
  };

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="bg-[#626F47] px-5 pt-3 pb-7 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="absolute -bottom-10 -left-5 w-[100px] h-[100px] bg-[rgba(164,180,101,0.12)] rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <p className="text-[12px] text-[rgba(245,236,213,0.72)]">
                {t("member.dashboard.greeting")}
              </p>
              <p className="font-display font-bold text-[18px] text-[#F5ECD5]">
                {user?.name ?? "—"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/member/notifications" aria-label={t("member.notifications.title")}>
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
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-[rgba(245,236,213,0.6)]" />
              <span className="text-[12px] text-[rgba(245,236,213,0.72)]">
                {user.messName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Amber band */}
      <div className="bg-[#F0BB78] px-5 pt-2.5 pb-7 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UtensilsCrossed size={14} className="text-[#2C2F1E]" />
          <span className="text-[12px] font-semibold text-[#2C2F1E]">
            {t("member.dashboard.todaysMeals")}
          </span>
        </div>
        <span className="text-[12px] font-semibold text-[#2C2F1E]">
          {bookedCount} {t("member.dashboard.booked")}
        </span>
      </div>

      {/* Overview card */}
      <div className="mx-4 -mt-5 relative z-10 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[12px] p-4 shadow-[0_4px_16px_rgba(74,60,30,0.1)]">
        <div className="flex items-center justify-between mb-3">
          <span className="font-display font-bold text-[14px] text-[#2C2F1E]">
            {t("member.dashboard.thisMonth")}
          </span>
          <Link to="/member/meal-bills" className="text-[12px] font-semibold text-[#626F47]">
            {t("member.dashboard.viewBill")}
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div>
            <div className="font-display font-bold text-[22px] text-[#626F47]">
              {bookedCount}
            </div>
            <div className="text-[10px] text-[#6B7550] uppercase tracking-[0.06em] mt-0.5">
              {t("member.dashboard.bookedStat")}
            </div>
          </div>
          <div>
            <div className="font-display font-bold text-[22px] text-[#2C2F1E]">
              {bookingRate}%
            </div>
            <div className="text-[10px] text-[#6B7550] uppercase tracking-[0.06em] mt-0.5">
              {t("member.dashboard.bookingRate")}
            </div>
          </div>
          <div>
            <div className="font-display font-bold text-[20px] text-[#2C2F1E]">
              {latestInvoice
                ? `৳${Number(latestInvoice.totalAmount ?? latestInvoice.grandTotal ?? 0).toLocaleString()}`
                : "—"}
            </div>
            <div className="text-[10px] text-[#6B7550] uppercase tracking-[0.06em] mt-0.5">
              {t("member.dashboard.due")}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-3.5">
        {/* Shared Bills Widget */}
        {mySharedInvoice && (
          <Link
            to="/member/shared-bills"
            className="flex items-center gap-3 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[12px] px-4 py-3 mb-3 shadow-[0_1px_4px_rgba(74,60,30,0.06)]"
          >
            <div className="w-9 h-9 bg-[rgba(98,111,71,0.1)] rounded-[10px] flex items-center justify-center shrink-0">
              <Split size={18} className="text-[#626F47]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[13px] text-[#2C2F1E]">
                {t("member.dashboard.sharedBillWidget")}
              </div>
              <div className="text-[11px] text-[#6B7550]">
                {t("member.dashboard.sharedBillAmount", {
                  amount: Number(mySharedInvoice.totalShare).toLocaleString(),
                })}
              </div>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                mySharedInvoice.paymentStatus === "paid"
                  ? "bg-[rgba(98,111,71,0.12)] text-[#626F47]"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {mySharedInvoice.paymentStatus === "paid"
                ? t("member.dashboard.sharedBillPaid")
                : t("member.dashboard.sharedBillUnpaid")}
            </span>
            <ChevronRight size={14} className="text-[#A09070] shrink-0" />
          </Link>
        )}

        {/* Today's Meals */}
        <div className="mb-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.08em]">
              {t("member.dashboard.todaysMenu")}
            </span>
            <Link to="/member/menu" className="text-[12px] font-semibold text-[#626F47]">
              {t("member.dashboard.seeAll")}
            </Link>
          </div>

          {menuLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : todaySlots.length === 0 ? (
            <div className="text-center py-6 text-[13px] text-[#A09070]">
              {t("member.dashboard.noMeals")}
            </div>
          ) : (
            todaySlots.map((slot) => (
              <div
                key={slot.id}
                className={`rounded-[12px] p-3 mb-2 flex items-center gap-3 border-[1.5px] shadow-[0_1px_4px_rgba(74,60,30,0.06)] ${mealBg(slot.mealType)}`}
              >
                <div
                  className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${mealIconBg(slot.mealType)}`}
                >
                  {mealIcon(slot.mealType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-[13px] text-[#2C2F1E] capitalize">
                    {slot.mealType}
                  </div>
                  <div className="text-[11px] text-[#6B7550] truncate">
                    {slot?.menuDescription || t("member.dashboard.menuNotSpecified")}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${slot.myBookingStatus === "booked" ? "bg-[#626F47] text-[#F5ECD5]" : "bg-[#E0D5BC] text-[#6B7550]"}`}
                >
                  {slot.myBookingStatus === "booked" ? t("common.booked") : t("common.notBooked")}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Quick links */}
        <div className="mb-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.08em]">
              {t("member.dashboard.quickAccess")}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                to: "/member/meal-bills",
                icon: Receipt,
                label: t("member.dashboard.mealBills"),
                sub: t("member.dashboard.mealBillsDesc"),
              },
              {
                to: "/member/shared-bills",
                icon: Calendar,
                label: t("member.dashboard.sharedBills"),
                sub: t("member.dashboard.sharedBillsDesc"),
              },
              {
                to: "/member/item-allocations",
                icon: UtensilsCrossed,
                label: t("member.dashboard.allocations"),
                sub: t("member.dashboard.allocationsDesc"),
              },
              {
                to: "/member/feedback",
                icon: Bell,
                label: t("member.dashboard.feedback"),
                sub: t("member.dashboard.feedbackDesc"),
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
                  <div className="font-semibold text-[13px] text-[#2C2F1E]">
                    {label}
                  </div>
                  <div className="text-[10px] text-[#6B7550]">{sub}</div>
                </div>
                <ChevronRight size={14} className="text-[#A09070] ml-auto shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
