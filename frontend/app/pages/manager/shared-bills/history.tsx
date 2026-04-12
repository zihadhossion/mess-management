import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Split } from "lucide-react";
import { get } from "~/services/httpMethods/get";
import type { SharedBillInvoice } from "~/types/shared-bill.d";

export default function SharedBillHistoryPage() {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<SharedBillInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    get<{ data: SharedBillInvoice[] }>("/shared-bills/invoices")
      .then((res) => setInvoices(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6">
        <Link
          to="/manager/shared-bills"
          className="flex items-center gap-2 text-[rgba(245,236,213,0.8)] text-[13px] mb-1"
        >
          <ArrowLeft size={16} /> {t("manager.sharedBills.historyBack")}
        </Link>
        <h1 className="font-display font-bold text-[20px] text-[#F5ECD5]">
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
            <p className="text-[14px] text-[#6B7550] font-semibold">
              {t("manager.sharedBills.noHistory")}
            </p>
          </div>
        ) : (
          invoices.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center gap-3 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4 mb-3"
            >
              <div className="w-10 h-10 bg-[rgba(98,111,71,0.1)] rounded-[10px] flex items-center justify-center shrink-0">
                <Split size={20} className="text-[#626F47]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-[14px] text-[#2C2F1E]">
                  {inv.month} {inv.year}
                </div>
                <div className="text-[12px] text-[#6B7550]">
                  {t("manager.sharedBills.historyTotal", {
                    total: inv.totalAmount.toLocaleString(),
                    share: inv.perMemberShare.toLocaleString(),
                  })}
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
