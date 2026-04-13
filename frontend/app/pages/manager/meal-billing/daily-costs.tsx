import { useEffect, useState } from "react";
import { ArrowLeft, Plus, DollarSign, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchDailyCosts } from "~/redux/features/billingSlice";
import { post } from "~/services/httpMethods/post";
import { del } from "~/services/httpMethods/delete";
import { getErrorMessage } from "~/utils/errorHandler";
import { format } from "date-fns";

export default function DailyCostsPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { dailyCosts, isLoading } = useAppSelector((s) => s.billing);
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    amount: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [month] = useState(format(new Date(), "yyyy-MM"));

  useEffect(() => {
    dispatch(fetchDailyCosts(month));
  }, [dispatch, month]);

  async function handleAdd() {
    if (!messId) return;
    setActionError(null);
    setIsSubmitting(true);
    try {
      await post(`/messes/${messId}/daily-costs`, {
        ...form,
        amount: parseFloat(form.amount),
      });
      setShowForm(false);
      setForm({ date: format(new Date(), "yyyy-MM-dd"), amount: "", description: "" });
      dispatch(fetchDailyCosts(month));
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!messId) return;
    try {
      await del(`/messes/${messId}/daily-costs/${id}`);
      dispatch(fetchDailyCosts(month));
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  const total = dailyCosts.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <Link
              to="/manager/meal-billing"
              className="flex items-center gap-2 text-[rgba(245,236,213,0.8)] text-[13px] mb-1"
            >
              <ArrowLeft size={16} /> {t("manager.mealBilling.back")}
            </Link>
            <h1 className="font-display font-bold text-[20px] text-[#F5ECD5]">
              {t("manager.mealBilling.dailyCosts")}
            </h1>
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
        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[12px] p-4 mb-4 flex items-center justify-between">
          <span className="text-[13px] text-[#6B7550]">{t("manager.mealBilling.monthTotal")}</span>
          <span className="font-display font-bold text-[20px] text-[#626F47]">
            ৳{total.toLocaleString()}
          </span>
        </div>

        {actionError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700">
            {actionError}
          </div>
        )}

        {showForm && (
          <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-4 mb-4">
            <h3 className="font-semibold text-[14px] text-[#2C2F1E] mb-3">
              {t("manager.mealBilling.addCostEntry")}
            </h3>
            {[
              { label: t("manager.mealBilling.date"), type: "date", key: "date" as const },
              { label: t("manager.mealBilling.amount"), type: "number", key: "amount" as const },
              { label: t("manager.mealBilling.description"), type: "text", key: "description" as const },
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
            <button
              onClick={handleAdd}
              disabled={isSubmitting || !form.amount}
              className="w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[14px] py-[11px] rounded-[10px] disabled:opacity-60"
            >
              {isSubmitting ? t("manager.mealBilling.adding") : t("manager.mealBilling.addEntry")}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : dailyCosts.length === 0 ? (
          <div className="text-center py-10">
            <DollarSign size={28} className="text-[#A09070] mx-auto mb-2" />
            <p className="text-[14px] text-[#6B7550] font-semibold">
              {t("manager.mealBilling.noCostEntries")}
            </p>
          </div>
        ) : (
          dailyCosts.map((cost) => (
            <div
              key={cost.id}
              className="flex items-center gap-3 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[12px] px-4 py-3 mb-2"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px] text-[#2C2F1E]">
                  ৳{cost.amount.toLocaleString()}
                </div>
                <div className="text-[12px] text-[#6B7550]">
                  {cost.date}
                  {cost.description ? ` · ${cost.description}` : ""}
                </div>
              </div>
              <button
                onClick={() => handleDelete(cost.id)}
                className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-[8px] text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
