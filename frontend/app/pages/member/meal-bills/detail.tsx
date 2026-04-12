import { useLocation, useParams } from "react-router";
import { ArrowLeft, Receipt } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { MealInvoice } from "~/types/billing.d";

export default function MealBillDetailPage() {
  const { state } = useLocation() as { state: { invoice?: MealInvoice } };
  const { month } = useParams();
  const { t } = useTranslation();
  const invoice = state?.invoice;

  if (!invoice) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <p className="text-[14px] text-[#6B7550]">
          {t("member.mealBills.notFound", { month })}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6">
        <Link
          to="/member/meal-bills"
          className="flex items-center gap-2 text-[rgba(245,236,213,0.8)] text-[14px] mb-4"
        >
          <ArrowLeft size={18} /> {t("member.mealBills.back")}
        </Link>
        <h1 className="font-display font-bold text-[20px] text-[#F5ECD5]">
          {invoice.month} {invoice.year}
        </h1>
        <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
          {t("member.mealBills.invoice")}
        </p>
      </div>

      <div className="px-4 pt-4">
        {/* Summary card */}
        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4 mb-4 shadow-[0_1px_4px_rgba(74,60,30,0.06)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[rgba(98,111,71,0.1)] rounded-[10px] flex items-center justify-center">
              <Receipt size={20} className="text-[#626F47]" />
            </div>
            <div>
              <div className="font-display font-bold text-[15px] text-[#2C2F1E]">
                {invoice.memberName}
              </div>
              <div className="text-[12px] text-[#6B7550]">
                {t("member.mealBills.invoice")} {invoice.month} {invoice.year}
              </div>
            </div>
          </div>

          {[
            { label: t("member.mealBills.totalMeals"), value: `${invoice.totalMeals} ${t("member.mealBills.portions")}` },
            { label: t("member.mealBills.mealCost"), value: `৳${invoice.totalCost.toLocaleString()}` },
            { label: t("member.mealBills.fixedCharges"), value: `৳${invoice.fixedCharges.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-[#EAE0CC]">
              <span className="text-[13px] text-[#6B7550]">{label}</span>
              <span className="text-[13px] font-semibold text-[#2C2F1E]">{value}</span>
            </div>
          ))}

          <div className="flex justify-between pt-3 mt-1">
            <span className="font-display font-bold text-[15px] text-[#2C2F1E]">
              {t("member.mealBills.grandTotal")}
            </span>
            <span className="font-display font-bold text-[18px] text-[#626F47]">
              ৳{invoice.grandTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Breakdown */}
        {invoice.breakdown?.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.08em] mb-3">
              {t("member.mealBills.mealBreakdown")}
            </p>
            {invoice.breakdown.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-[#FBF5E8] border border-[#D9CEB4] rounded-[10px] px-4 py-2.5 mb-2"
              >
                <div>
                  <div className="text-[13px] font-semibold text-[#2C2F1E]">
                    {item.date}
                  </div>
                  <div className="text-[11px] text-[#6B7550] capitalize">
                    {item.mealType} · {item.portions} {t("member.mealBills.portions")}
                  </div>
                </div>
                <span className="text-[13px] font-semibold text-[#2C2F1E]">
                  ৳{item.cost.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
