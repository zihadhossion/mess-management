import { useEffect } from "react";
import { ArrowLeft, Receipt } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchMyInvoices } from "~/redux/features/billingSlice";

export default function BillHistoryPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { invoices, isLoading } = useAppSelector((s) => s.billing);

  useEffect(() => {
    dispatch(fetchMyInvoices());
  }, [dispatch]);

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
            {t("manager.mealBilling.historyTitle")}
          </h1>
          <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
            {t("manager.mealBilling.historySubtitle")}
          </p>
        </div>
      </div>

      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <Receipt size={28} className="text-[#A09070] mx-auto mb-3" />
            <p className="text-[14px] text-[#6B7550] font-semibold">
              {t("manager.mealBilling.noBillingHistory")}
            </p>
          </div>
        ) : (
          invoices.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center gap-3 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4 mb-3 shadow-[0_1px_4px_rgba(74,60,30,0.06)]"
            >
              <div className="w-10 h-10 bg-[rgba(98,111,71,0.1)] rounded-[10px] flex items-center justify-center shrink-0">
                <Receipt size={20} className="text-[#626F47]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-[14px] text-[#2C2F1E]">
                  {inv.month} {inv.year}
                </div>
                <div className="text-[12px] text-[#6B7550]">
                  {t("manager.mealBilling.meals", { count: inv.totalMeals })} · ৳{inv.grandTotal.toLocaleString()}
                </div>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${inv.status === "paid" ? "bg-[rgba(98,111,71,0.12)] text-[#626F47]" : "bg-amber-50 text-amber-700"}`}
              >
                {inv.status === "paid" ? t("common.paid") : t("common.unpaid")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
