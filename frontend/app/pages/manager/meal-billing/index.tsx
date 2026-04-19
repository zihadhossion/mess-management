import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  CreditCard,
  DollarSign,
  Tag,
  Package,
  CheckSquare,
  History,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { useEffect } from "react";
import { fetchDailyCosts, fetchFixedCharges } from "~/redux/features/billingSlice";
import { format } from "date-fns";

export default function MealBillingOverviewPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { dailyCosts, fixedCharges } = useAppSelector((s) => s.billing);

  useEffect(() => {
    dispatch(fetchDailyCosts(format(new Date(), "yyyy-MM")));
    dispatch(fetchFixedCharges());
  }, [dispatch]);

  const totalCosts = dailyCosts.reduce((sum, c) => sum + c.amount, 0);
  const totalFixed = fixedCharges
    .filter((c) => c.isActive)
    .reduce((sum, c) => sum + c.amount, 0);

  const sections = [
    {
      to: "/manager/meal-billing/daily-costs",
      icon: DollarSign,
      label: t("manager.mealBilling.dailyCosts"),
      sub: t("manager.mealBilling.marketDesc"),
    },
    {
      to: "/manager/meal-billing/fixed-charges",
      icon: Tag,
      label: t("manager.mealBilling.fixedCharges"),
      sub: t("manager.mealBilling.fixedDesc"),
    },
    {
      to: "/manager/meal-billing/item-types",
      icon: Package,
      label: t("manager.mealBilling.itemTypes"),
      sub: t("manager.mealBilling.itemTypesDesc"),
    },
    {
      to: "/manager/meal-billing/finalize",
      icon: CheckSquare,
      label: t("manager.mealBilling.finalize"),
      sub: t("manager.mealBilling.finalizeDesc"),
    },
    {
      to: "/manager/meal-billing/history",
      icon: History,
      label: t("manager.mealBilling.history"),
      sub: t("manager.mealBilling.historyDesc"),
    },
  ];

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-7 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="relative z-10">
          <h1 className="font-display font-bold text-[length:var(--fs-2xl)] text-[#F5ECD5]">
            {t("manager.mealBilling.title")}
          </h1>
          <p className="text-[length:var(--fs-md)] text-[rgba(245,236,213,0.72)]">
            {format(new Date(), "MMMM yyyy")}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mx-4 -mt-3.5 relative z-10 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[12px] p-4 shadow-[0_4px_16px_rgba(74,60,30,0.1)] mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="font-display font-bold text-[length:var(--fs-3xl)] text-[#626F47]">
              ৳{totalCosts.toLocaleString()}
            </div>
            <div className="text-[length:var(--fs-2xs)] text-[#6B7550] uppercase tracking-[0.06em]">
              {t("manager.mealBilling.marketCosts")}
            </div>
          </div>
          <div className="text-center">
            <div className="font-display font-bold text-[length:var(--fs-3xl)] text-[#2C2F1E]">
              ৳{totalFixed.toLocaleString()}
            </div>
            <div className="text-[length:var(--fs-2xs)] text-[#6B7550] uppercase tracking-[0.06em]">
              {t("manager.mealBilling.fixedMonth")}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">
        {sections.map(({ to, icon: Icon, label, sub }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4 mb-3 shadow-[0_1px_4px_rgba(74,60,30,0.06)] hover:border-[#626F47] transition-colors"
          >
            <div className="w-10 h-10 bg-[rgba(98,111,71,0.1)] rounded-[10px] flex items-center justify-center shrink-0">
              <Icon size={20} className="text-[#626F47]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[length:var(--fs-base)] text-[#2C2F1E]">{label}</div>
              <div className="text-[length:var(--fs-sm)] text-[#6B7550]">{sub}</div>
            </div>
            <CreditCard size={16} className="text-[#A09070] shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
