import { useLocation, useParams } from "react-router";
import { Link } from "react-router";
import { ArrowLeft, Split } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SharedBillInvoice } from "~/types/shared-bill.d";

export default function SharedBillDetailPage() {
  const { state } = useLocation() as { state: { invoice?: SharedBillInvoice } };
  const { month } = useParams();
  const { t } = useTranslation();
  const invoice = state?.invoice;

  if (!invoice) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <p className="text-[14px] text-[#6B7550]">
          {t("member.sharedBills.notFound", { month })}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6">
        <Link
          to="/member/shared-bills"
          className="flex items-center gap-2 text-[rgba(245,236,213,0.8)] text-[14px] mb-4"
        >
          <ArrowLeft size={18} /> {t("member.sharedBills.back")}
        </Link>
        <h1 className="font-display font-bold text-[20px] text-[#F5ECD5]">
          {invoice.month} {invoice.year}
        </h1>
        <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
          {t("member.sharedBills.invoice")}
        </p>
      </div>

      <div className="px-4 pt-4">
        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[rgba(98,111,71,0.1)] rounded-[10px] flex items-center justify-center">
              <Split size={20} className="text-[#626F47]" />
            </div>
            <div>
              <div className="font-display font-bold text-[15px] text-[#2C2F1E]">
                {invoice.memberName}
              </div>
              <div className="text-[12px] text-[#6B7550]">
                {t("member.sharedBills.sharedBill")} {invoice.month} {invoice.year}
              </div>
            </div>
          </div>

          <div className="flex justify-between py-2 border-b border-[#EAE0CC]">
            <span className="text-[13px] text-[#6B7550]">{t("member.sharedBills.totalBills")}</span>
            <span className="text-[13px] font-semibold text-[#2C2F1E]">
              ৳{invoice.totalAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between pt-3">
            <span className="font-display font-bold text-[15px] text-[#2C2F1E]">
              {t("member.sharedBills.yourShare").replace(":", "")}
            </span>
            <span className="font-display font-bold text-[18px] text-[#626F47]">
              ৳{invoice.perMemberShare.toLocaleString()}
            </span>
          </div>
        </div>

        {invoice.entries?.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.08em] mb-3">
              {t("member.sharedBills.billEntries")}
            </p>
            {invoice.entries.map((entry) => (
              <div
                key={entry.id}
                className="flex justify-between items-center bg-[#FBF5E8] border border-[#D9CEB4] rounded-[10px] px-4 py-2.5 mb-2"
              >
                <div>
                  <div className="text-[13px] font-semibold text-[#2C2F1E]">
                    {entry.categoryName}
                  </div>
                  {entry.note && (
                    <div className="text-[11px] text-[#6B7550]">{entry.note}</div>
                  )}
                </div>
                <span className="text-[13px] font-semibold text-[#2C2F1E]">
                  ৳{entry.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
