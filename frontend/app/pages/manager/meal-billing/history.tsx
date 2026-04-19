import { useEffect, useState } from "react";
import { ArrowLeft, Receipt, ChevronDown, ChevronUp, CheckCircle, X } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "~/redux/store/hooks";
import { get } from "~/services/httpMethods/get";
import { post } from "~/services/httpMethods/post";
import { getErrorMessage } from "~/utils/errorHandler";
import type { MonthlyBillSummary, MealInvoice, RecordMealPaymentDto } from "~/types/billing.d";
import { format } from "date-fns";
import toast from "react-hot-toast";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const PAYMENT_METHODS = [
  { value: "CASH", labelKey: "manager.mealBilling.methodCash" },
  { value: "BKASH", labelKey: "manager.mealBilling.methodBkash" },
  { value: "BANK_TRANSFER", labelKey: "manager.mealBilling.methodBank" },
  { value: "OTHER", labelKey: "manager.mealBilling.methodOther" },
];

export default function BillHistoryPage() {
  const { t } = useTranslation();
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const [summaries, setSummaries] = useState<MonthlyBillSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [invoicesByMonth, setInvoicesByMonth] = useState<Record<string, MealInvoice[]>>({});
  const [invoicesLoading, setInvoicesLoading] = useState<string | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<MealInvoice | null>(null);
  const [paymentForm, setPaymentForm] = useState<RecordMealPaymentDto>({
    amount: 0,
    method: "CASH",
    paymentDate: format(new Date(), "yyyy-MM-dd"),
    referenceNote: "",
  });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (!messId) return;
    setIsLoading(true);
    get<{ data: MonthlyBillSummary[] }>(`/messes/${messId}/billing/history`)
      .then((res) => setSummaries(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [messId]);

  async function toggleExpand(summary: MonthlyBillSummary) {
    const key = `${summary.month}-${summary.year}`;
    if (expanded === key) {
      setExpanded(null);
      return;
    }
    setExpanded(key);
    if (invoicesByMonth[key]) return;
    if (!messId) return;
    setInvoicesLoading(key);
    try {
      const res = await get<{ data: MealInvoice[] }>(
        `/messes/${messId}/billing/invoices?month=${summary.month}&year=${summary.year}`
      );
      setInvoicesByMonth((prev) => ({ ...prev, [key]: res.data }));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setInvoicesLoading(null);
    }
  }

  async function handleRecordPayment() {
    if (!paymentTarget || !messId) return;
    setPaymentError(null);
    setPaymentSubmitting(true);
    try {
      await post(`/messes/${messId}/billing/invoices/${paymentTarget.id}/payment`, {
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        paymentDate: paymentForm.paymentDate,
        referenceNote: paymentForm.referenceNote || undefined,
      });
      toast.success(t("manager.mealBilling.paymentSuccess"));
      // Refresh invoices for the relevant month
      const summ = summaries.find((s) => {
        const invs = invoicesByMonth[`${s.month}-${s.year}`];
        return invs?.some((i) => i.id === paymentTarget.id);
      });
      if (summ && messId) {
        const key = `${summ.month}-${summ.year}`;
        const res = await get<{ data: MealInvoice[] }>(
          `/messes/${messId}/billing/invoices?month=${summ.month}&year=${summ.year}`
        );
        setInvoicesByMonth((prev) => ({ ...prev, [key]: res.data }));
      }
      setPaymentTarget(null);
      setPaymentForm({ amount: 0, method: "CASH", paymentDate: format(new Date(), "yyyy-MM-dd"), referenceNote: "" });
    } catch (err) {
      setPaymentError(getErrorMessage(err));
    } finally {
      setPaymentSubmitting(false);
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
        ) : summaries.length === 0 ? (
          <div className="text-center py-12">
            <Receipt size={28} className="text-[#A09070] mx-auto mb-3" />
            <p className="text-[14px] text-[#6B7550] font-semibold">
              {t("manager.mealBilling.noMonthlyHistory")}
            </p>
          </div>
        ) : (
          summaries.map((summary) => {
            const key = `${summary.month}-${summary.year}`;
            const isOpen = expanded === key;
            const invoices = invoicesByMonth[key] ?? [];
            const paidCount = invoices.filter(
              (i) => i.paymentStatus === "paid"
            ).length;

            return (
              <div key={key} className="mb-3">
                <button
                  onClick={() => toggleExpand(summary)}
                  className="w-full flex items-center gap-3 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4 shadow-[0_1px_4px_rgba(74,60,30,0.06)] text-left"
                >
                  <div className="w-10 h-10 bg-[rgba(98,111,71,0.1)] rounded-[10px] flex items-center justify-center shrink-0">
                    <Receipt size={20} className="text-[#626F47]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-[14px] text-[#2C2F1E]">
                      {MONTHS[(summary.month as number) - 1]} {summary.year}
                    </div>
                    <div className="text-[12px] text-[#6B7550]">
                      {t("manager.mealBilling.summaryCost", { cost: Number(summary.totalCost).toLocaleString() })} ·{" "}
                      {t("manager.mealBilling.summaryCPM", { cpm: Number(summary.costPerMeal).toFixed(2) })}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        summary.status === "finalized" || summary.status === "FINALIZED"
                          ? "bg-[rgba(98,111,71,0.12)] text-[#626F47]"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {summary.status === "finalized" || summary.status === "FINALIZED"
                        ? t("manager.mealBilling.summaryFinalized")
                        : t("manager.mealBilling.summaryOpen")}
                    </span>
                    {isOpen ? <ChevronUp size={16} className="text-[#6B7550]" /> : <ChevronDown size={16} className="text-[#6B7550]" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="border border-[#D9CEB4] border-t-0 rounded-b-[14px] bg-[#FDFAF3] px-4 py-3">
                    {invoicesLoading === key ? (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : invoices.length === 0 ? (
                      <p className="text-center text-[13px] text-[#6B7550] py-3">
                        {t("manager.mealBilling.noInvoices")}
                      </p>
                    ) : (
                      <>
                        {/* Progress bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-[#6B7550]">
                              {t("manager.mealBilling.paymentTracking")}
                            </span>
                            <span className="text-[11px] text-[#626F47] font-semibold">
                              {t("manager.mealBilling.paidCount", { paid: paidCount, total: invoices.length })}
                            </span>
                          </div>
                          <div className="h-1.5 bg-[#E8DFC8] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#626F47] rounded-full"
                              style={{ width: `${invoices.length ? (paidCount / invoices.length) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        {invoices.map((inv) => {
                          const isPaid = inv.paymentStatus === "paid";
                          const memberName = inv.messMember?.user?.name ?? "—";
                          return (
                            <div
                              key={inv.id}
                              className="flex items-center gap-2 py-2 border-b border-[#E8DFC8] last:border-0"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-[13px] text-[#2C2F1E]">{memberName}</div>
                                <div className="text-[11px] text-[#6B7550]">
                                  ৳{Number(inv.totalAmount).toLocaleString()}
                                  {inv.mealPortions > 0 && ` · ${inv.mealPortions} meals`}
                                </div>
                              </div>
                              {isPaid ? (
                                <div className="flex items-center gap-1">
                                  <CheckCircle size={13} className="text-[#626F47]" />
                                  <span className="text-[11px] font-semibold text-[#626F47]">{t("common.paid")}</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setPaymentTarget(inv);
                                    setPaymentForm({
                                      amount: Number(inv.totalAmount),
                                      method: "CASH",
                                      paymentDate: format(new Date(), "yyyy-MM-dd"),
                                      referenceNote: "",
                                    });
                                    setPaymentError(null);
                                  }}
                                  className="px-2.5 py-1 bg-[#F0BB78] text-[#2C2F1E] font-semibold text-[11px] rounded-[6px]"
                                >
                                  {t("manager.mealBilling.recordPayment")}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Record Payment Modal */}
      {paymentTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-[#FDFAF3] rounded-t-[20px] p-5 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-[17px] text-[#2C2F1E]">
                {t("manager.mealBilling.recordPayment")}
              </h3>
              <button
                onClick={() => { setPaymentTarget(null); setPaymentError(null); }}
                className="w-8 h-8 flex items-center justify-center text-[#6B7550]"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-[13px] text-[#6B7550] mb-4">
              {paymentTarget.messMember?.user?.name ?? "—"} — ৳{Number(paymentTarget.totalAmount).toLocaleString()}
            </p>

            {paymentError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700">
                {paymentError}
              </div>
            )}

            {[
              { label: t("manager.mealBilling.paymentAmount"), key: "amount" as const, type: "number" },
              { label: t("manager.mealBilling.paymentDate"), key: "paymentDate" as const, type: "date" },
              { label: t("manager.mealBilling.paymentNote"), key: "referenceNote" as const, type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key} className="mb-3">
                <label className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-1.5 block">
                  {label}
                </label>
                <input
                  type={type}
                  value={String(paymentForm[key])}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      [key]: type === "number" ? Number(e.target.value) : e.target.value,
                    })
                  }
                  className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[10px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47]"
                />
              </div>
            ))}

            <div className="mb-4">
              <label className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-1.5 block">
                {t("manager.mealBilling.paymentMethod")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map(({ value, labelKey }) => (
                  <button
                    key={value}
                    onClick={() => setPaymentForm({ ...paymentForm, method: value })}
                    className={`py-2 text-[13px] font-semibold rounded-[8px] border transition-colors ${
                      paymentForm.method === value
                        ? "bg-[#626F47] text-[#F5ECD5] border-[#626F47]"
                        : "bg-[#FDFAF3] text-[#2C2F1E] border-[#D9CEB4]"
                    }`}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRecordPayment}
              disabled={paymentSubmitting || !paymentForm.amount}
              className="w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[14px] py-[12px] rounded-[10px] disabled:opacity-60"
            >
              {paymentSubmitting ? t("manager.mealBilling.recording") : t("manager.mealBilling.record")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
