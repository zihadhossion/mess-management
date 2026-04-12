import { useState } from "react";
import { ArrowLeft, CheckSquare, AlertCircle } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { post } from "~/services/httpMethods/post";
import { getErrorMessage } from "~/utils/errorHandler";
import { format } from "date-fns";
import { useAppSelector } from "~/redux/store/hooks";

export default function FinalizeBillingPage() {
  const { t } = useTranslation();
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const currentMonth = format(new Date(), "MMMM yyyy");
  const monthParam = format(new Date(), "yyyy-MM");

  async function handleFinalize() {
    if (!messId) return;
    if (!confirm(t("manager.mealBilling.confirmFinalize", { month: currentMonth }))) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await post(`/messes/${messId}/billing/finalize`, { month: monthParam });
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6 relative overflow-hidden">
        <div className="relative z-10">
          <Link
            to="/manager/meal-billing"
            className="flex items-center gap-2 text-[rgba(245,236,213,0.8)] text-[13px] mb-1"
          >
            <ArrowLeft size={16} /> {t("manager.mealBilling.back")}
          </Link>
          <h1 className="font-display font-bold text-[20px] text-[#F5ECD5]">
            {t("manager.mealBilling.finalizeTitle")}
          </h1>
          <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
            {currentMonth}
          </p>
        </div>
      </div>

      <div className="px-4 pt-6">
        {success ? (
          <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-6 text-center">
            <div className="w-16 h-16 bg-[#626F47] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquare size={32} className="text-[#F5ECD5]" />
            </div>
            <h2 className="font-display font-bold text-[20px] text-[#2C2F1E] mb-2">
              {t("manager.mealBilling.finalizeSuccess")}
            </h2>
            <p className="text-[13px] text-[#6B7550] mb-6">
              {t("manager.mealBilling.finalizeSuccessDesc")}
            </p>
            <Link
              to="/manager/meal-billing/history"
              className="block w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[15px] py-[13px] rounded-[12px] text-center"
            >
              {t("manager.mealBilling.viewBillHistory")}
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-[rgba(240,187,120,0.15)] border border-[rgba(240,187,120,0.4)] rounded-[14px] p-4 mb-5 flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-amber-600 shrink-0 mt-0.5"
              />
              <div>
                <div className="font-semibold text-[14px] text-[#2C2F1E] mb-1">
                  {t("manager.mealBilling.beforeFinalizing")}
                </div>
                <ul className="text-[12px] text-[#6B7550] space-y-1 list-disc list-inside">
                  <li>{t("manager.mealBilling.beforeCheck1")}</li>
                  <li>{t("manager.mealBilling.beforeCheck2")}</li>
                  <li>{t("manager.mealBilling.beforeCheck3")}</li>
                  <li>{t("manager.mealBilling.beforeCheck4")}</li>
                </ul>
              </div>
            </div>

            <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4 mb-5">
              <h3 className="font-semibold text-[14px] text-[#2C2F1E] mb-3">
                {t("manager.mealBilling.howItWorks")}
              </h3>
              <div className="space-y-2">
                {[
                  t("manager.mealBilling.step1"),
                  t("manager.mealBilling.step2"),
                  t("manager.mealBilling.step3"),
                  t("manager.mealBilling.step4"),
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-[#626F47] text-[#F5ECD5] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-[12px] text-[#6B7550]">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleFinalize}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#626F47] text-[#F5ECD5] font-bold text-[15px] py-[14px] rounded-[12px] disabled:opacity-60"
            >
              <CheckSquare size={20} />
              {isSubmitting
                ? t("manager.mealBilling.finalizing")
                : t("manager.mealBilling.finalizeBtnLabel", { month: currentMonth })}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
