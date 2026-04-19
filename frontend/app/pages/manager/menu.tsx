import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Coffee, Sun, Moon, Eye, EyeOff, Trash2, CalendarDays, Calendar } from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchMenuSlots } from "~/redux/features/menuSlice";
import { post } from "~/services/httpMethods/post";
import { patch } from "~/services/httpMethods/patch";
import { del } from "~/services/httpMethods/delete";
import { getErrorMessage } from "~/utils/errorHandler";
import { format, addDays, startOfWeek } from "date-fns";
import type { MealSlot } from "~/types/menu.d";

type View = "day" | "week";

export default function ManagerMenuPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { slots, isLoading } = useAppSelector((s) => s.menu);
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const [view, setView] = useState<View>("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    type: "lunch",
    menuDescription: "",
    timeWindowStart: "",
    timeWindowEnd: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadSlots(v = view, d = currentDate) {
    if (v === "day") {
      const dateStr = format(d, "yyyy-MM-dd");
      dispatch(fetchMenuSlots({ startDate: dateStr, endDate: dateStr }));
    } else {
      const weekStart = startOfWeek(d, { weekStartsOn: 0 });
      dispatch(fetchMenuSlots({
        startDate: format(weekStart, "yyyy-MM-dd"),
        endDate: format(addDays(weekStart, 6), "yyyy-MM-dd"),
      }));
    }
  }

  useEffect(() => {
    loadSlots();
  }, [dispatch, view, currentDate]);

  async function handleCreate() {
    if (!messId) return;
    setActionError(null);
    setIsSubmitting(true);
    try {
      await post(`/messes/${messId}/meal-slots`, form);
      setShowForm(false);
      setForm({ date: format(new Date(), "yyyy-MM-dd"), type: "lunch", menuDescription: "", timeWindowStart: "", timeWindowEnd: "" });
      loadSlots();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function togglePublish(slotId: string, isPublished: boolean) {
    if (!messId) return;
    try {
      await patch(`/messes/${messId}/meal-slots/${slotId}`, { isPublished: !isPublished });
      loadSlots();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function handleDelete(slotId: string) {
    if (!messId) return;
    try {
      await del(`/messes/${messId}/meal-slots/${slotId}`);
      loadSlots();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  const mealIconBg = (type: string) => {
    if (type === "breakfast") return "bg-[#F0BB78] text-[#2C2F1E]";
    if (type === "lunch") return "bg-[#626F47] text-[#F5ECD5]";
    return "bg-[#A4B465] text-white";
  };

  const mealIcon = (type: string) => {
    if (type === "breakfast") return <Coffee size={16} />;
    if (type === "lunch") return <Sun size={16} />;
    return <Moon size={16} />;
  };

  function SlotCard({ slot }: { slot: MealSlot }) {
    return (
      <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4 mb-3 shadow-[0_1px_4px_rgba(74,60,30,0.06)]">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${mealIconBg(slot.mealType)}`}>
            {mealIcon(slot.mealType)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-[length:var(--fs-base)] text-[#2C2F1E] capitalize">
                {slot.mealType}
              </span>
              <span
                className={`text-[length:var(--fs-2xs)] font-semibold px-2 py-0.5 rounded-full ${
                  slot.isPublished
                    ? "bg-[rgba(98,111,71,0.12)] text-[#626F47]"
                    : "bg-[rgba(160,144,112,0.12)] text-[#A09070]"
                }`}
              >
                {slot.isPublished ? t("manager.menu.published") : t("manager.menu.draft")}
              </span>
            </div>
            {slot.menuDescription && (
              <div className="text-[length:var(--fs-sm)] text-[#6B7550] mt-0.5">{slot.menuDescription}</div>
            )}
            {slot.timeWindowStart && (
              <div className="text-[length:var(--fs-xs)] text-[#A09070] mt-0.5">
                {slot.timeWindowStart} – {slot.timeWindowEnd}
              </div>
            )}
            <div className="text-[length:var(--fs-xs)] text-[#A09070] mt-0.5">
              {t("manager.menu.bookings", { count: slot.bookingCount })}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => togglePublish(slot.id, slot.isPublished)}
              title={slot.isPublished ? t("manager.menu.unpublish") : t("manager.menu.publish")}
              className={`w-8 h-8 rounded-[8px] flex items-center justify-center ${slot.isPublished ? "bg-[rgba(98,111,71,0.12)] text-[#626F47]" : "bg-[#F0F0E8] text-[#A09070]"}`}
            >
              {slot.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button
              onClick={() => handleDelete(slot.id)}
              className="w-8 h-8 rounded-[8px] flex items-center justify-center bg-red-50 text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function slotsByDate(date: Date): MealSlot[] {
    const d = format(date, "yyyy-MM-dd");
    return slots.filter((s) => s.date === d);
  }

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-4 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="relative z-10 flex items-center justify-between mb-3">
          <div>
            <h1 className="font-display font-bold text-[length:var(--fs-2xl)] text-[#F5ECD5]">
              {t("manager.menu.title")}
            </h1>
            <p className="text-[length:var(--fs-md)] text-[rgba(245,236,213,0.72)]">
              {t("manager.menu.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-[rgba(0,0,0,0.2)] rounded-[8px] p-0.5">
              <button
                onClick={() => setView("day")}
                className={`w-8 h-7 flex items-center justify-center rounded-[6px] transition-colors ${view === "day" ? "bg-[#F5ECD5] text-[#2C2F1E]" : "text-[rgba(245,236,213,0.7)]"}`}
              >
                <Calendar size={14} />
              </button>
              <button
                onClick={() => setView("week")}
                className={`w-8 h-7 flex items-center justify-center rounded-[6px] transition-colors ${view === "week" ? "bg-[#F5ECD5] text-[#2C2F1E]" : "text-[rgba(245,236,213,0.7)]"}`}
              >
                <CalendarDays size={14} />
              </button>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-9 h-9 bg-[#F0BB78] rounded-full flex items-center justify-center text-[#2C2F1E]"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Date/week label */}
        {view === "day" ? (
          <div className="flex items-center justify-between bg-[rgba(245,236,213,0.12)] rounded-[10px] px-3 py-2">
            <button
              onClick={() => setCurrentDate(d => addDays(d, -1))}
              className="text-[#F5ECD5] px-1"
            >‹</button>
            <span className="text-[length:var(--fs-md)] font-semibold text-[#F5ECD5]">
              {format(currentDate, "EEE, dd MMM yyyy")}
            </span>
            <button
              onClick={() => setCurrentDate(d => addDays(d, 1))}
              className="text-[#F5ECD5] px-1"
            >›</button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-[rgba(245,236,213,0.12)] rounded-[10px] px-3 py-2">
            <button
              onClick={() => setCurrentDate(d => addDays(d, -7))}
              className="text-[#F5ECD5] px-1"
            >‹</button>
            <span className="text-[length:var(--fs-md)] font-semibold text-[#F5ECD5]">
              {format(weekStart, "dd MMM")} – {format(addDays(weekStart, 6), "dd MMM yyyy")}
            </span>
            <button
              onClick={() => setCurrentDate(d => addDays(d, 7))}
              className="text-[#F5ECD5] px-1"
            >›</button>
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        {actionError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[length:var(--fs-md)] text-red-700">
            {actionError}
          </div>
        )}

        {showForm && (
          <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-4 mb-4">
            <h3 className="font-display font-bold text-[length:var(--fs-lg)] text-[#2C2F1E] mb-3">
              {t("manager.menu.newSlot")}
            </h3>
            {[
              { label: t("manager.menu.date"), type: "date", key: "date" as const },
              { label: t("manager.menu.items"), type: "text", key: "menuDescription" as const },
            ].map(({ label, type, key }) => (
              <div key={key} className="mb-3">
                <label className="text-[length:var(--fs-xs)] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-1.5 block">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[10px] text-[length:var(--fs-base)] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47]"
                />
              </div>
            ))}
            <div className="flex gap-3 mb-3">
              {(["timeWindowStart", "timeWindowEnd"] as const).map((key) => (
                <div key={key} className="flex-1">
                  <label className="text-[length:var(--fs-xs)] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-1.5 block">
                    {key === "timeWindowStart" ? t("manager.menu.timeStart") : t("manager.menu.timeEnd")}
                  </label>
                  <input
                    type="time"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[10px] text-[length:var(--fs-base)] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47]"
                  />
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label className="text-[length:var(--fs-xs)] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-1.5 block">
                {t("manager.menu.mealType")}
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[10px] text-[length:var(--fs-base)] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47]"
              >
                <option value="breakfast">{t("manager.menu.breakfast")}</option>
                <option value="lunch">{t("manager.menu.lunch")}</option>
                <option value="dinner">{t("manager.menu.dinner")}</option>
              </select>
            </div>
            <button
              onClick={handleCreate}
              disabled={isSubmitting}
              className="w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[length:var(--fs-base)] py-[11px] rounded-[10px] disabled:opacity-60"
            >
              {isSubmitting ? t("manager.menu.creating") : t("manager.menu.createSlot")}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : view === "day" ? (
          slots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[length:var(--fs-base)] text-[#6B7550] font-semibold">{t("manager.menu.noSlots")}</p>
              <p className="text-[length:var(--fs-sm)] text-[#A09070] mt-1">{t("manager.menu.noSlotsDesc")}</p>
            </div>
          ) : (
            slots.map((slot) => <SlotCard key={slot.id} slot={slot} />)
          )
        ) : (
          weekDays.map((day) => {
            const daySlots = slotsByDate(day);
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            return (
              <div key={day.toISOString()} className="mb-4">
                <div className={`flex items-center gap-2 mb-2 ${isToday ? "text-[#626F47]" : "text-[#6B7550]"}`}>
                  <span className={`font-display font-bold text-[length:var(--fs-md)] ${isToday ? "text-[#626F47]" : "text-[#2C2F1E]"}`}>
                    {format(day, "EEE, dd MMM")}
                  </span>
                  {isToday && (
                    <span className="text-[length:var(--fs-2xs)] font-semibold bg-[rgba(98,111,71,0.12)] text-[#626F47] px-1.5 py-0.5 rounded-full">
                      {t("member.menu.today")}
                    </span>
                  )}
                  <span className="text-[length:var(--fs-sm)] text-[#A09070] ml-auto">
                    {daySlots.length > 0 ? t("manager.menu.slotsCount", { count: daySlots.length }) : t("manager.menu.noSlotsDay")}
                  </span>
                </div>
                {daySlots.length > 0 ? (
                  daySlots.map((slot) => <SlotCard key={slot.id} slot={slot} />)
                ) : (
                  <div className="border border-dashed border-[#D9CEB4] rounded-[12px] py-3 text-center text-[length:var(--fs-sm)] text-[#A09070]">
                    {t("manager.menu.noSlotsDay")}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
