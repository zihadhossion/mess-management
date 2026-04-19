import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Split, ChevronRight, CheckCircle, Clock } from "lucide-react";
import { get } from "~/services/httpMethods/get";
import { useAppSelector } from "~/redux/store/hooks";
import type { SharedBillInvoice } from "~/types/shared-bill.d";

export default function SharedBillsPage() {
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<SharedBillInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!messId) return;
    get<{ data: SharedBillInvoice[] }>(`/messes/${messId}/shared-bills/invoices`)
      .then((res) => setInvoices(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [messId]);

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="relative z-10">
          <h1 className="font-display font-bold text-[20px] text-[#F5ECD5]">
            {t("member.sharedBills.title")}
          </h1>
          <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
            {t("member.sharedBills.subtitle")}
          </p>
        </div>
      </div>

      <div className="px-4 pt-4 md:max-w-3xl md:mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-[rgba(98,111,71,0.1)] rounded-full flex items-center justify-center mx-auto mb-3">
              <Split size={28} className="text-[#A09070]" />
            </div>
            <p className="text-[14px] text-[#6B7550] font-semibold">
              {t("member.sharedBills.noData")}
            </p>
            <p className="text-[12px] text-[#A09070] mt-1">
              {t("member.sharedBills.noDataDesc")}
            </p>
          </div>
        ) : (
          invoices.map((inv) => (
            <Link
              key={inv.id}
              to={`/member/shared-bills/${inv.month}-${inv.year}`}
              state={{ invoice: inv }}
              className="flex items-center gap-3 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4 mb-3 shadow-[0_1px_4px_rgba(74,60,30,0.06)] hover:border-[#626F47] transition-colors"
            >
              <div className="w-10 h-10 bg-[rgba(98,111,71,0.1)] rounded-[10px] flex items-center justify-center shrink-0">
                <Split size={20} className="text-[#626F47]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-[14px] text-[#2C2F1E]">
                  {inv.month} {inv.year}
                </div>
                <div className="text-[12px] text-[#6B7550]">
                  {t("member.sharedBills.yourShare")} ৳{(inv.totalShare ?? 0).toLocaleString()}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {inv.status === "paid" ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-[#626F47] bg-[rgba(98,111,71,0.12)] px-2 py-0.5 rounded-full">
                    <CheckCircle size={10} /> {t("member.sharedBills.paid")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    <Clock size={10} /> {t("member.sharedBills.unpaid")}
                  </span>
                )}
                <ChevronRight size={16} className="text-[#A09070]" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
