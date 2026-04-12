import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Coffee, Sun, Moon, Eye, EyeOff, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchMenuSlots } from "~/redux/features/menuSlice";
import { post } from "~/services/httpMethods/post";
import { patch } from "~/services/httpMethods/patch";
import { del } from "~/services/httpMethods/delete";
import { getErrorMessage } from "~/utils/errorHandler";
import { format } from "date-fns";

export default function ManagerMenuPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { slots, isLoading } = useAppSelector((s) => s.menu);
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    mealType: "lunch",
    items: "",
    timeRange: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchMenuSlots({ startDate: format(new Date(), "yyyy-MM-dd") }));
  }, [dispatch]);

  async function handleCreate() {
    if (!messId) return;
    setActionError(null);
    setIsSubmitting(true);
    try {
      await post(`/messes/${messId}/meal-slots`, form);
      setShowForm(false);
      setForm({ date: format(new Date(), "yyyy-MM-dd"), mealType: "lunch", items: "", timeRange: "" });
      dispatch(fetchMenuSlots({ startDate: format(new Date(), "yyyy-MM-dd") }));
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
      dispatch(fetchMenuSlots({ startDate: format(new Date(), "yyyy-MM-dd") }));
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function handleDelete(slotId: string) {
    if (!messId) return;
    try {
      await del(`/messes/${messId}/meal-slots/${slotId}`);
      dispatch(fetchMenuSlots({ startDate: format(new Date(), "yyyy-MM-dd") }));
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
    if (type === "breakfast") return <Coffee size={18} />;
    if (type === "lunch") return <Sun size={18} />;
    return <Moon size={18} />;
  };

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-[20px] text-[#F5ECD5]">
              {t("manager.menu.title")}
            </h1>
            <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
              {t("manager.menu.subtitle")}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-9 h-9 bg-[#F0BB78] rounded-full flex items-center justify-center text-[#2C2F1E]"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        {actionError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700">
            {actionError}
          </div>
        )}

        {showForm && (
          <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-4 mb-4">
            <h3 className="font-display font-bold text-[15px] text-[#2C2F1E] mb-3">
              {t("manager.menu.newSlot")}
            </h3>
            {[
              { label: t("manager.menu.date"), type: "date", key: "date" as const },
              { label: t("manager.menu.items"), type: "text", key: "items" as const },
              { label: t("manager.menu.timeRange"), type: "text", key: "timeRange" as const },
            ].map(({ label, type, key }) => (
              <div key={key} className="mb-3">
                <label className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-1.5 block">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[10px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47]"
                />
              </div>
            ))}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-1.5 block">
                {t("manager.menu.mealType")}
              </label>
              <select
                value={form.mealType}
                onChange={(e) => setForm({ ...form, mealType: e.target.value })}
                className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[10px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47]"
              >
                <option value="breakfast">{t("manager.menu.breakfast")}</option>
                <option value="lunch">{t("manager.menu.lunch")}</option>
                <option value="dinner">{t("manager.menu.dinner")}</option>
              </select>
            </div>
            <button
              onClick={handleCreate}
              disabled={isSubmitting}
              className="w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[14px] py-[11px] rounded-[10px] disabled:opacity-60"
            >
              {isSubmitting ? t("manager.menu.creating") : t("manager.menu.createSlot")}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[14px] text-[#6B7550] font-semibold">
              {t("manager.menu.noSlots")}
            </p>
            <p className="text-[12px] text-[#A09070] mt-1">
              {t("manager.menu.noSlotsDesc")}
            </p>
          </div>
        ) : (
          slots.map((slot) => (
            <div
              key={slot.id}
              className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4 mb-3 shadow-[0_1px_4px_rgba(74,60,30,0.06)]"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${mealIconBg(slot.mealType)}`}>
                  {mealIcon(slot.mealType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-[14px] text-[#2C2F1E] capitalize">
                    {slot.mealType} · {slot.date}
                  </div>
                  {slot.items && (
                    <div className="text-[12px] text-[#6B7550]">{slot.items}</div>
                  )}
                  <div className="text-[11px] text-[#A09070]">
                    {t("manager.menu.bookings", { count: slot.bookingCount })}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => togglePublish(slot.id, slot.isPublished)}
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
          ))
        )}
      </div>
    </div>
  );
}
