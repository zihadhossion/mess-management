import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Split } from "lucide-react";
import { get } from "~/services/httpMethods/get";
import { useAppSelector } from "~/redux/store/hooks";
import type { SharedBillInvoice } from "~/types/shared-bill.d";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function SharedBillHistoryPage() {
  const { t } = useTranslation();
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const [invoices, setInvoices] = useState<SharedBillInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!messId) return;
    // Load last 6 months of invoices
    const now = new Date();
    const requests = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return get<{ data: SharedBillInvoice[] }>(
        `/messes/${messId}/shared-bills/invoices?month=${d.getMonth() + 1}&year=${d.getFullYear()}`
      ).then((r) => r.data).catch(() => []);
    });
    Promise.all(requests)
      .then((results) => {
        const flat = results.flat();
        // Deduplicate by month+year and pick one invoice per month (they're per-member)
        const seen = new Set<string>();
        const deduped = flat.filter((inv) => {
          const key = `${inv.month}-${inv.year}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setInvoices(deduped.sort((a, b) => b.year - a.year || b.month - a.month));
      })
      .finally(() => setIsLoading(false));
  }, [messId]);

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6">
        <Link
          to="/manager/shared-bills"
          className="flex items-center gap-2 text-[rgba(245,236,213,0.8)] text-[length:var(--fs-md)] mb-1"
        >
          <ArrowLeft size={16} /> {t("manager.sharedBills.historyBack")}
        </Link>
        <h1 className="font-display font-bold text-[length:var(--fs-2xl)] text-[#F5ECD5]">
          {t("manager.sharedBills.historyTitle")}
        </h1>
      </div>

      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <Split size={28} className="text-[#A09070] mx-auto mb-3" />
            <p className="text-[length:var(--fs-base)] text-[#6B7550] font-semibold">
              {t("manager.sharedBills.noHistory")}
            </p>
          </div>
        ) : (
          invoices.map((inv) => (
            <div
              key={`${inv.month}-${inv.year}`}
              className="flex items-center gap-3 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4 mb-3"
            >
              <div className="w-10 h-10 bg-[rgba(98,111,71,0.1)] rounded-[10px] flex items-center justify-center shrink-0">
                <Split size={20} className="text-[#626F47]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-[length:var(--fs-base)] text-[#2C2F1E]">
                  {MONTHS[(inv.month as number) - 1] ?? inv.month} {inv.year}
                </div>
                <div className="text-[length:var(--fs-sm)] text-[#6B7550]">
                  {t("manager.sharedBills.historyTotal", {
                    share: Number(inv.totalShare).toLocaleString(),
                    members: inv.activeMemberCount,
                  })}
                </div>
              </div>
              <span
                className={`text-[length:var(--fs-xs)] font-semibold px-2 py-0.5 rounded-full ${
                  inv.paymentStatus === "paid"
                    ? "bg-[rgba(98,111,71,0.12)] text-[#626F47]"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {inv.paymentStatus === "paid"
                  ? t("common.paid")
                  : t("common.unpaid")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
