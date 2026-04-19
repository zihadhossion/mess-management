import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Tag,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchFixedCharges } from "~/redux/features/billingSlice";
import { post } from "~/services/httpMethods/post";
import { patch } from "~/services/httpMethods/patch";
import { del } from "~/services/httpMethods/delete";
import { getErrorMessage } from "~/utils/errorHandler";

export default function FixedChargesPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { fixedCharges, isLoading } = useAppSelector((s) => s.billing);
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchFixedCharges());
  }, [dispatch]);

  async function handleAdd() {
    if (!messId) return;
    setActionError(null);
    setIsSubmitting(true);
    try {
      await post(`/messes/${messId}/fixed-charges`, {
        name: form.name,
        amount: parseFloat(form.amount),
      });
      setShowForm(false);
      setForm({ name: "", amount: "" });
      dispatch(fetchFixedCharges());
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    if (!messId) return;
    try {
      await patch(`/messes/${messId}/fixed-charges/${id}/toggle`, {
        isActive: !isActive,
      });
      dispatch(fetchFixedCharges());
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function handleDelete(id: string) {
    if (!messId) return;
    try {
      await del(`/messes/${messId}/fixed-charges/${id}`);
      dispatch(fetchFixedCharges());
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <Link
              to="/manager/meal-billing"
              className="flex items-center gap-2 text-[rgba(245,236,213,0.8)] text-[length:var(--fs-md)] mb-1"
            >
              <ArrowLeft size={16} /> {t("manager.mealBilling.back")}
            </Link>
            <h1 className="font-display font-bold text-[length:var(--fs-2xl)] text-[#F5ECD5]">
              {t("manager.mealBilling.fixedCharges")}
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
        {actionError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[length:var(--fs-md)] text-red-700">
            {actionError}
          </div>
        )}

        {showForm && (
          <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-4 mb-4">
            <h3 className="font-semibold text-[length:var(--fs-base)] text-[#2C2F1E] mb-3">
              {t("manager.mealBilling.addFixedCharge")}
            </h3>
            {[
              { label: t("manager.mealBilling.chargeName"), key: "name" as const },
              { label: t("manager.mealBilling.amount"), key: "amount" as const },
            ].map(({ label, key }) => (
              <div key={key} className="mb-3">
                <label className="text-[length:var(--fs-xs)] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-1.5 block">
                  {label}
                </label>
                <input
                  type={key === "amount" ? "number" : "text"}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[10px] text-[length:var(--fs-base)] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47]"
                />
              </div>
            ))}
            <button
              onClick={handleAdd}
              disabled={isSubmitting || !form.name || !form.amount}
              className="w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[length:var(--fs-base)] py-[11px] rounded-[10px] disabled:opacity-60"
            >
              {isSubmitting ? t("manager.mealBilling.adding") : t("manager.mealBilling.addCharge")}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : fixedCharges.length === 0 ? (
          <div className="text-center py-10">
            <Tag size={28} className="text-[#A09070] mx-auto mb-2" />
            <p className="text-[length:var(--fs-base)] text-[#6B7550] font-semibold">
              {t("manager.mealBilling.noFixedCharges")}
            </p>
          </div>
        ) : (
          fixedCharges.map((charge) => (
            <div
              key={charge.id}
              className="flex items-center gap-3 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[12px] px-4 py-3 mb-2"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[length:var(--fs-base)] text-[#2C2F1E]">
                  {charge.name}
                </div>
                <div className="text-[length:var(--fs-md)] text-[#626F47] font-bold">
                  ৳{charge.amount.toLocaleString()}{t("manager.mealBilling.perMonth")}
                </div>
              </div>
              <button
                onClick={() => handleToggle(charge.id, charge.isActive)}
                className="text-[#626F47]"
              >
                {charge.isActive ? (
                  <ToggleRight size={24} />
                ) : (
                  <ToggleLeft size={24} className="text-[#A09070]" />
                )}
              </button>
              <button
                onClick={() => handleDelete(charge.id)}
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
