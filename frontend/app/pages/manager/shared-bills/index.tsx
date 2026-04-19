import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Split, Plus, History, Trash2, ToggleLeft, ToggleRight, CreditCard, CheckCircle, X } from "lucide-react";
import { get } from "~/services/httpMethods/get";
import { post } from "~/services/httpMethods/post";
import { del } from "~/services/httpMethods/delete";
import { getErrorMessage } from "~/utils/errorHandler";
import { useAppSelector } from "~/redux/store/hooks";
import type {
  SharedBillEntry,
  SharedBillCategory,
  SharedBillInvoice,
  RecordSharedBillPaymentDto,
} from "~/types/shared-bill.d";
import { format } from "date-fns";
import toast from "react-hot-toast";

type Tab = "entries" | "categories" | "payments";

const PAYMENT_METHODS = [
  { value: "CASH", labelKey: "manager.sharedBills.methodCash" },
  { value: "BKASH", labelKey: "manager.sharedBills.methodBkash" },
  { value: "BANK_TRANSFER", labelKey: "manager.sharedBills.methodBank" },
  { value: "OTHER", labelKey: "manager.sharedBills.methodOther" },
];

export default function ManagerSharedBillsPage() {
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("entries");

  const monthInt = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const monthName = format(new Date(), "MMMM");

  // Entries state
  const [entries, setEntries] = useState<SharedBillEntry[]>([]);
  const [categories, setCategories] = useState<SharedBillCategory[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [entryForm, setEntryForm] = useState({ categoryId: "", totalAmount: "", referenceNote: "" });
  const [entrySubmitting, setEntrySubmitting] = useState(false);
  const [entryError, setEntryError] = useState<string | null>(null);

  // Finalize state
  const [finalizing, setFinalizing] = useState(false);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);

  // Categories state
  const [catsLoading, setCatsLoading] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  // Payments state
  const [invoices, setInvoices] = useState<SharedBillInvoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<SharedBillInvoice | null>(null);
  const [paymentForm, setPaymentForm] = useState<RecordSharedBillPaymentDto>({
    amount: 0,
    method: "CASH",
    paymentDate: format(new Date(), "yyyy-MM-dd"),
    referenceNote: "",
  });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  function loadEntries() {
    if (!messId) return;
    setEntriesLoading(true);
    Promise.all([
      get<{ data: SharedBillEntry[] }>(`/messes/${messId}/shared-bills/entries?month=${monthInt}&year=${year}`),
      get<{ data: SharedBillCategory[] }>(`/messes/${messId}/shared-bills/categories`),
    ])
      .then(([entriesRes, catsRes]) => {
        setEntries(entriesRes.data);
        setCategories(catsRes.data);
      })
      .catch(() => {})
      .finally(() => setEntriesLoading(false));
  }

  function loadCategories() {
    if (!messId) return;
    setCatsLoading(true);
    get<{ data: SharedBillCategory[] }>(`/messes/${messId}/shared-bills/categories`)
      .then((res) => setCategories(res.data))
      .catch(() => {})
      .finally(() => setCatsLoading(false));
  }

  function loadInvoices() {
    if (!messId) return;
    setInvoicesLoading(true);
    get<{ data: SharedBillInvoice[] }>(
      `/messes/${messId}/shared-bills/invoices?month=${monthInt}&year=${year}`
    )
      .then((res) => setInvoices(res.data))
      .catch(() => {})
      .finally(() => setInvoicesLoading(false));
  }

  useEffect(() => {
    loadEntries();
  }, [messId]);

  useEffect(() => {
    if (tab === "categories") loadCategories();
    if (tab === "payments") loadInvoices();
  }, [tab, messId]);

  async function handleAddEntry() {
    if (!messId) return;
    setEntryError(null);
    setEntrySubmitting(true);
    try {
      await post(`/messes/${messId}/shared-bills/entries`, {
        categoryId: entryForm.categoryId,
        totalAmount: parseFloat(entryForm.totalAmount),
        month: monthInt,
        year,
        referenceNote: entryForm.referenceNote || undefined,
        entryDate: format(new Date(), "yyyy-MM-dd"),
      });
      setShowEntryForm(false);
      setEntryForm({ categoryId: "", totalAmount: "", referenceNote: "" });
      loadEntries();
    } catch (err) {
      setEntryError(getErrorMessage(err));
    } finally {
      setEntrySubmitting(false);
    }
  }

  async function handleDeleteEntry(id: string) {
    if (!messId || !confirm(t("manager.sharedBills.deleteEntryConfirm"))) return;
    try {
      await del(`/messes/${messId}/shared-bills/entries/${id}`);
      loadEntries();
    } catch {
      toast.error(t("common.error"));
    }
  }

  async function handleFinalize() {
    if (!messId) return;
    setFinalizing(true);
    setShowFinalizeConfirm(false);
    try {
      await post(`/messes/${messId}/shared-bills/finalize`, { month: monthInt, year });
      toast.success(t("manager.sharedBills.finalizeSuccess"));
      setTab("payments");
      loadInvoices();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setFinalizing(false);
    }
  }

  async function handleAddCategory() {
    if (!messId || !catName.trim()) return;
    setCatError(null);
    setCatSubmitting(true);
    try {
      await post(`/messes/${messId}/shared-bills/categories`, { name: catName.trim() });
      setCatName("");
      setShowCatForm(false);
      loadCategories();
      // reload entries too so the dropdown is updated
      loadEntries();
    } catch (err) {
      setCatError(getErrorMessage(err));
    } finally {
      setCatSubmitting(false);
    }
  }

  async function handleToggleCategory(id: string) {
    if (!messId) return;
    try {
      await post(`/messes/${messId}/shared-bills/categories/${id}/toggle`, {});
      loadCategories();
    } catch {
      toast.error(t("common.error"));
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!messId || !confirm(t("manager.sharedBills.deleteEntryConfirm"))) return;
    try {
      await del(`/messes/${messId}/shared-bills/categories/${id}`);
      loadCategories();
      loadEntries();
    } catch {
      toast.error(t("common.error"));
    }
  }

  async function handleRecordPayment() {
    if (!paymentTarget) return;
    setPaymentError(null);
    setPaymentSubmitting(true);
    try {
      await post(`/messes/${paymentTarget.messId}/shared-bills/invoices/${paymentTarget.id}/payment`, {
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        paymentDate: paymentForm.paymentDate,
        referenceNote: paymentForm.referenceNote || undefined,
      });
      toast.success(t("manager.sharedBills.paymentSuccess"));
      setPaymentTarget(null);
      setPaymentForm({ amount: 0, method: "CASH", paymentDate: format(new Date(), "yyyy-MM-dd"), referenceNote: "" });
      loadInvoices();
    } catch (err) {
      setPaymentError(getErrorMessage(err));
    } finally {
      setPaymentSubmitting(false);
    }
  }

  const total = entries.reduce((sum, e) => sum + (e.totalAmount ?? e.amount ?? 0), 0);
  const paidCount = invoices.filter((inv) => inv.paymentStatus === "paid").length;
  const activeCategories = categories.filter((c) => c.isActive);

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-[#626F47] px-5 pt-3 pb-4 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-[20px] text-[#F5ECD5]">
              {t("manager.sharedBills.title")}
            </h1>
            <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
              {monthName} {year}
            </p>
          </div>
          <Link
            to="/manager/shared-bills/history"
            className="w-9 h-9 bg-[rgba(245,236,213,0.15)] rounded-full flex items-center justify-center text-[#F5ECD5]"
          >
            <History size={18} />
          </Link>
        </div>

        {/* Tab bar */}
        <div className="relative z-10 flex gap-1 mt-3 bg-[rgba(0,0,0,0.15)] rounded-[10px] p-1">
          {(["entries", "categories", "payments"] as Tab[]).map((t_) => (
            <button
              key={t_}
              onClick={() => setTab(t_)}
              className={`flex-1 py-1.5 text-[12px] font-semibold rounded-[8px] transition-colors ${
                tab === t_
                  ? "bg-[#F5ECD5] text-[#2C2F1E]"
                  : "text-[rgba(245,236,213,0.7)]"
              }`}
            >
              {t(`manager.sharedBills.tab${t_.charAt(0).toUpperCase() + t_.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      {/* ENTRIES TAB */}
      {tab === "entries" && (
        <div className="px-4 pt-4">
          {/* Month total */}
          <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[12px] p-4 mb-4 flex items-center justify-between">
            <span className="text-[13px] text-[#6B7550]">{t("manager.sharedBills.monthTotal")}</span>
            <span className="font-display font-bold text-[20px] text-[#626F47]">
              ৳{total.toLocaleString()}
            </span>
          </div>

          {/* Add entry button */}
          <button
            onClick={() => setShowEntryForm(!showEntryForm)}
            className="w-full flex items-center justify-center gap-2 bg-[#626F47] text-[#F5ECD5] font-semibold text-[13px] py-[10px] rounded-[10px] mb-4"
          >
            <Plus size={16} /> {t("manager.sharedBills.addEntry")}
          </button>

          {entryError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700">
              {entryError}
            </div>
          )}

          {showEntryForm && (
            <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-4 mb-4">
              <h3 className="font-semibold text-[14px] text-[#2C2F1E] mb-3">
                {t("manager.sharedBills.addEntry")}
              </h3>
              <div className="mb-3">
                <label className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-1.5 block">
                  {t("manager.sharedBills.category")}
                </label>
                <select
                  value={entryForm.categoryId}
                  onChange={(e) => setEntryForm({ ...entryForm, categoryId: e.target.value })}
                  className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[10px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47]"
                >
                  <option value="">{t("manager.sharedBills.selectCategory")}</option>
                  {activeCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {[
                { label: t("manager.sharedBills.amount"), key: "totalAmount" as const, type: "number" },
                { label: t("manager.sharedBills.note"), key: "referenceNote" as const, type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key} className="mb-3">
                  <label className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-1.5 block">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={entryForm[key]}
                    onChange={(e) => setEntryForm({ ...entryForm, [key]: e.target.value })}
                    className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[10px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47]"
                  />
                </div>
              ))}
              <button
                onClick={handleAddEntry}
                disabled={entrySubmitting || !entryForm.categoryId || !entryForm.totalAmount}
                className="w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[14px] py-[11px] rounded-[10px] disabled:opacity-60"
              >
                {entrySubmitting ? t("manager.sharedBills.adding") : t("manager.sharedBills.add")}
              </button>
            </div>
          )}

          {entriesLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-10">
              <Split size={28} className="text-[#A09070] mx-auto mb-2" />
              <p className="text-[14px] text-[#6B7550] font-semibold">
                {t("manager.sharedBills.noEntries")}
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[12px] px-4 py-3 mb-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px] text-[#2C2F1E]">
                    {entry.category?.name ?? entry.categoryName}
                  </div>
                  {(entry.referenceNote ?? entry.note) && (
                    <div className="text-[12px] text-[#6B7550]">{entry.referenceNote ?? entry.note}</div>
                  )}
                </div>
                <span className="font-display font-bold text-[15px] text-[#2C2F1E]">
                  ৳{(entry.totalAmount ?? entry.amount ?? 0).toLocaleString()}
                </span>
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}

          {/* Finalize section */}
          {entries.length > 0 && (
            <div className="mt-4 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-4">
              <h3 className="font-semibold text-[14px] text-[#2C2F1E] mb-1">
                {t("manager.sharedBills.finalizeTitle")}
              </h3>
              <p className="text-[12px] text-[#6B7550] mb-3">
                {t("manager.sharedBills.finalizeDesc")}
              </p>
              {!showFinalizeConfirm ? (
                <button
                  onClick={() => setShowFinalizeConfirm(true)}
                  className="w-full bg-[#F0BB78] text-[#2C2F1E] font-bold text-[14px] py-[11px] rounded-[10px]"
                >
                  {t("manager.sharedBills.finalize")}
                </button>
              ) : (
                <div>
                  <p className="text-[13px] font-semibold text-[#2C2F1E] mb-2">
                    {t("manager.sharedBills.finalizeConfirm", { month: monthName, year })}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowFinalizeConfirm(false)}
                      className="flex-1 border border-[#D9CEB4] text-[#6B7550] font-semibold text-[13px] py-[10px] rounded-[10px]"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      onClick={handleFinalize}
                      disabled={finalizing}
                      className="flex-1 bg-[#626F47] text-[#F5ECD5] font-bold text-[13px] py-[10px] rounded-[10px] disabled:opacity-60"
                    >
                      {finalizing ? t("manager.sharedBills.finalizing") : t("common.confirm")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CATEGORIES TAB */}
      {tab === "categories" && (
        <div className="px-4 pt-4">
          <button
            onClick={() => setShowCatForm(!showCatForm)}
            className="w-full flex items-center justify-center gap-2 bg-[#626F47] text-[#F5ECD5] font-semibold text-[13px] py-[10px] rounded-[10px] mb-4"
          >
            <Plus size={16} /> {t("manager.sharedBills.addCategory")}
          </button>

          {catError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700">
              {catError}
            </div>
          )}

          {showCatForm && (
            <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-4 mb-4">
              <label className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-1.5 block">
                {t("manager.sharedBills.categoryName")}
              </label>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder={t("manager.sharedBills.categoryNamePlaceholder")}
                className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[10px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47] mb-3"
              />
              <button
                onClick={handleAddCategory}
                disabled={catSubmitting || !catName.trim()}
                className="w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[14px] py-[11px] rounded-[10px] disabled:opacity-60"
              >
                {catSubmitting ? t("manager.sharedBills.addingCategory") : t("manager.sharedBills.addCategoryBtn")}
              </button>
            </div>
          )}

          {catsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-10">
              <Split size={28} className="text-[#A09070] mx-auto mb-2" />
              <p className="text-[14px] text-[#6B7550] font-semibold">
                {t("manager.sharedBills.noCategories")}
              </p>
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[12px] px-4 py-3 mb-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px] text-[#2C2F1E]">{cat.name}</div>
                  <div className="text-[11px] mt-0.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold ${
                        cat.isActive
                          ? "bg-[rgba(98,111,71,0.12)] text-[#626F47]"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {cat.isActive ? t("common.active") : t("common.inactive")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleCategory(cat.id)}
                  className="w-8 h-8 flex items-center justify-center text-[#626F47]"
                  title={t("manager.sharedBills.toggleActive")}
                >
                  {cat.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} className="text-gray-400" />}
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* PAYMENTS TAB */}
      {tab === "payments" && (
        <div className="px-4 pt-4">
          {/* Payment progress */}
          {invoices.length > 0 && (
            <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[12px] p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] text-[#6B7550] font-semibold">
                  {t("manager.sharedBills.paymentStatus")}
                </span>
                <span className="text-[12px] text-[#626F47] font-semibold">
                  {t("manager.sharedBills.paidCount", { paid: paidCount, total: invoices.length })}
                </span>
              </div>
              <div className="h-2 bg-[#E8DFC8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#626F47] rounded-full transition-all"
                  style={{ width: `${invoices.length ? (paidCount / invoices.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {invoicesLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-10">
              <CreditCard size={28} className="text-[#A09070] mx-auto mb-2" />
              <p className="text-[14px] text-[#6B7550] font-semibold">
                {t("manager.sharedBills.noInvoices")}
              </p>
            </div>
          ) : (
            invoices.map((inv) => {
              const isPaid = inv.paymentStatus === "paid";
              const memberName = inv.messMember?.user?.name ?? "—";
              return (
                <div
                  key={inv.id}
                  className="flex items-center gap-3 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[12px] px-4 py-3 mb-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px] text-[#2C2F1E]">{memberName}</div>
                    <div className="font-display font-bold text-[15px] text-[#626F47]">
                      ৳{Number(inv.totalShare).toLocaleString()}
                    </div>
                  </div>
                  {isPaid ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-[rgba(98,111,71,0.12)] rounded-full">
                      <CheckCircle size={13} className="text-[#626F47]" />
                      <span className="text-[11px] font-semibold text-[#626F47]">{t("common.paid")}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setPaymentTarget(inv);
                        setPaymentForm({
                          amount: Number(inv.totalShare),
                          method: "CASH",
                          paymentDate: format(new Date(), "yyyy-MM-dd"),
                          referenceNote: "",
                        });
                        setPaymentError(null);
                      }}
                      className="px-3 py-1.5 bg-[#F0BB78] text-[#2C2F1E] font-semibold text-[12px] rounded-[8px]"
                    >
                      {t("manager.sharedBills.recordPayment")}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-[#FDFAF3] rounded-t-[20px] p-5 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-[17px] text-[#2C2F1E]">
                {t("manager.sharedBills.recordPayment")}
              </h3>
              <button
                onClick={() => { setPaymentTarget(null); setPaymentError(null); }}
                className="w-8 h-8 flex items-center justify-center text-[#6B7550]"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-[13px] text-[#6B7550] mb-4">
              {paymentTarget.messMember?.user?.name} — ৳{Number(paymentTarget.totalShare).toLocaleString()}
            </p>

            {paymentError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700">
                {paymentError}
              </div>
            )}

            {[
              { label: t("manager.sharedBills.paymentAmount"), key: "amount" as const, type: "number" },
              { label: t("manager.sharedBills.paymentDate"), key: "paymentDate" as const, type: "date" },
              { label: t("manager.sharedBills.paymentNote"), key: "referenceNote" as const, type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key} className="mb-3">
                <label className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-1.5 block">
                  {label}
                </label>
                <input
                  type={type}
                  value={String(paymentForm[key])}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, [key]: type === "number" ? Number(e.target.value) : e.target.value })
                  }
                  className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[10px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47]"
                />
              </div>
            ))}

            <div className="mb-4">
              <label className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-1.5 block">
                {t("manager.sharedBills.paymentMethod")}
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
              {paymentSubmitting ? t("manager.sharedBills.recording") : t("manager.sharedBills.record")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
