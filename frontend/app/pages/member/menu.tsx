import { useEffect, useState } from "react";
import { format, addDays, subDays, startOfDay } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  Sun,
  Moon,
  X,
  Plus,
  CalendarCheck,
  CalendarX,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchMenuSlots } from "~/redux/features/menuSlice";
import { post } from "~/services/httpMethods/post";
import { del } from "~/services/httpMethods/delete";
import { get } from "~/services/httpMethods/get";
import { getErrorMessage } from "~/utils/errorHandler";
import type { MealSlot } from "~/types/menu.d";
import toast from "react-hot-toast";

export default function MemberMenuPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { slots, isLoading } = useAppSelector((s) => s.menu);
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState<"book" | "cancel" | null>(null);

  const dateStr = format(currentDate, "yyyy-MM-dd");

  useEffect(() => {
    dispatch(fetchMenuSlots({ startDate: dateStr, endDate: dateStr }));
  }, [dispatch, dateStr]);

  function refreshDay() {
    dispatch(fetchMenuSlots({ startDate: dateStr, endDate: dateStr }));
  }

  async function handleBook(slotId: string) {
    if (!messId) return;
    setActionError(null);
    setActionLoading(slotId);
    try {
      await post(`/messes/${messId}/bookings`, { mealSlotId: slotId });
      refreshDay();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel(bookingId: string, slotId: string) {
    if (!messId) return;
    setActionError(null);
    setActionLoading(slotId);
    try {
      await del(`/messes/${messId}/bookings/${bookingId}`);
      refreshDay();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleBulkBook() {
    if (!messId || bulkLoading) return;
    setBulkLoading("book");
    try {
      const start = format(new Date(), "yyyy-MM-dd");
      const end = format(addDays(new Date(), 6), "yyyy-MM-dd");
      const res = await get<{ data: MealSlot[] }>(
        `/messes/${messId}/meal-slots`,
        { startDate: start, endDate: end }
      );
      const unbooked = res.data.filter(
        (s) => s.isPublished && !s.myBookingId
      );
      await Promise.allSettled(
        unbooked.map((s) =>
          post(`/messes/${messId}/bookings`, { mealSlotId: s.id })
        )
      );
      toast.success(t("member.menu.bulkBookSuccess", { count: unbooked.length }));
      refreshDay();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setBulkLoading(null);
    }
  }

  async function handleBulkCancel() {
    if (!messId || bulkLoading) return;
    setBulkLoading("cancel");
    try {
      const start = format(new Date(), "yyyy-MM-dd");
      const end = format(addDays(new Date(), 6), "yyyy-MM-dd");
      const res = await get<{ data: MealSlot[] }>(
        `/messes/${messId}/meal-slots`,
        { startDate: start, endDate: end }
      );
      const booked = res.data.filter(
        (s) => s.myBookingId && s.myBookingStatus === "booked"
      );
      await Promise.allSettled(
        booked.map((s) => del(`/messes/${messId}/bookings/${s.myBookingId}`))
      );
      toast.success(t("member.menu.bulkCancelSuccess", { count: booked.length }));
      refreshDay();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setBulkLoading(null);
    }
  }

  const mealIconBg = (type: string) => {
    if (type === "breakfast") return "bg-[#F0BB78] text-[#2C2F1E]";
    if (type === "lunch") return "bg-[#626F47] text-[#F5ECD5]";
    return "bg-[#A4B465] text-white";
  };

  const mealIcon = (type: string) => {
    if (type === "breakfast") return <Coffee size={18} />;
    if (type === "lunch") return <Sun size={18} />;
    return <Moon size={18} />;
  };

  const isToday = dateStr === format(new Date(), "yyyy-MM-dd");
  const isPast = currentDate < startOfDay(new Date());

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-[#626F47] px-5 pt-3 pb-4 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="relative z-10">
          <h1 className="font-display font-bold text-[20px] text-[#F5ECD5] mb-4">
            {t("member.menu.title")}
          </h1>
          {/* Date navigator */}
          <div className="flex items-center justify-between bg-[rgba(245,236,213,0.12)] rounded-[12px] px-3 py-2">
            <button
              aria-label={t("member.menu.prevDay")}
              onClick={() => setCurrentDate(subDays(currentDate, 1))}
              className="w-8 h-8 flex items-center justify-center text-[#F5ECD5]"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <div className="font-display font-bold text-[15px] text-[#F5ECD5]">
                {isToday ? t("member.menu.today") : format(currentDate, "EEEE")}
              </div>
              <div className="text-[12px] text-[rgba(245,236,213,0.72)]">
                {format(currentDate, "dd MMM yyyy")}
              </div>
            </div>
            <button
              aria-label={t("member.menu.nextDay")}
              onClick={() => setCurrentDate(addDays(currentDate, 1))}
              className="w-8 h-8 flex items-center justify-center text-[#F5ECD5]"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Bulk actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleBulkBook}
              disabled={!!bulkLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[rgba(245,236,213,0.15)] text-[#F5ECD5] text-[12px] font-semibold rounded-[10px] disabled:opacity-50"
            >
              <CalendarCheck size={14} />
              {bulkLoading === "book" ? t("member.menu.booking") : t("member.menu.bookWeek")}
            </button>
            <button
              onClick={handleBulkCancel}
              disabled={!!bulkLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[rgba(245,236,213,0.15)] text-[#F5ECD5] text-[12px] font-semibold rounded-[10px] disabled:opacity-50"
            >
              <CalendarX size={14} />
              {bulkLoading === "cancel" ? t("member.menu.cancelling") : t("member.menu.cancelWeek")}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {actionError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700">
            {actionError}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-[rgba(98,111,71,0.1)] rounded-full flex items-center justify-center mx-auto mb-3">
              <Sun size={28} className="text-[#A09070]" />
            </div>
            <p className="text-[14px] text-[#6B7550] font-semibold">
              {t("member.menu.noMeals")}
            </p>
            <p className="text-[12px] text-[#A09070] mt-1">
              {t("member.menu.noMealsDesc")}
            </p>
          </div>
        ) : (
          slots.map((slot) => {
            const canCancel = !isPast && slot.myBookingId && slot.myBookingStatus === "booked";
            const canBook = !isPast && slot.isPublished && !slot.myBookingId;
            const deadlineText = !isPast && slot.myBookingId
              ? t("member.menu.cancelDeadline")
              : null;

            return (
              <div
                key={slot.id}
                className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4 mb-3 shadow-[0_1px_4px_rgba(74,60,30,0.06)]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${mealIconBg(slot.mealType)}`}
                  >
                    {mealIcon(slot.mealType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-[14px] text-[#2C2F1E] capitalize">
                      {slot.mealType}
                    </div>
                    <div className="text-[12px] text-[#6B7550]">
                      {slot.timeWindowStart && slot.timeWindowEnd
                        ? `${slot.timeWindowStart} – ${slot.timeWindowEnd}`
                        : "—"}
                    </div>
                    {slot.menuDescription && (
                      <div className="text-[12px] text-[#2C2F1E] mt-1">
                        {slot.menuDescription}
                      </div>
                    )}
                    {deadlineText && (
                      <div className="text-[11px] text-amber-600 mt-1">
                        {deadlineText}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    {canCancel ? (
                      <button
                        onClick={() => handleCancel(slot.myBookingId!, slot.id)}
                        disabled={actionLoading === slot.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-[8px] text-[12px] font-semibold disabled:opacity-50"
                      >
                        <X size={14} /> {t("member.menu.cancel")}
                      </button>
                    ) : canBook ? (
                      <button
                        onClick={() => handleBook(slot.id)}
                        disabled={actionLoading === slot.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#626F47] text-[#F5ECD5] rounded-[8px] text-[12px] font-semibold disabled:opacity-50"
                      >
                        <Plus size={14} /> {t("member.menu.book")}
                      </button>
                    ) : slot.myBookingId ? (
                      <span className="text-[11px] text-[#626F47] font-semibold px-2 py-1 bg-[rgba(98,111,71,0.1)] rounded-[6px]">
                        {t("common.booked")}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#A09070] font-semibold">
                        {isPast ? t("member.menu.past") : t("member.menu.notPublished")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
