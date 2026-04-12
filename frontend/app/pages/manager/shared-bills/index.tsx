import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Split, Plus, History } from "lucide-react";
import { get } from "~/services/httpMethods/get";
import { post } from "~/services/httpMethods/post";
import { getErrorMessage } from "~/utils/errorHandler";
import { useAppSelector } from "~/redux/store/hooks";
import type { SharedBillEntry, SharedBillCategory } from "~/types/shared-bill.d";
import { format } from "date-fns";

export default function ManagerSharedBillsPage() {
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const { t } = useTranslation();
  const [entries, setEntries] = useState<SharedBillEntry[]>([]);
  const [categories, setCategories] = useState<SharedBillCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ categoryId: "", amount: "", note: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const month = format(new Date(), "MMMM");
  const year = new Date().getFullYear();

  function load() {
    if (!messId) return;
    setIsLoading(true);
    Promise.all([
      get<{ data: SharedBillEntry[] }>(`/messes/${messId}/shared-bills/entries?month=${month}&year=${year}`),
      get<{ data: SharedBillCategory[] }>(`/messes/${messId}/shared-bills/categories`),
    ])
      .then(([entriesRes, catsRes]) => {
        setEntries(entriesRes.data);
        setCategories(catsRes.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    if (!messId) return;
    setActionError(null);
    setIsSubmitting(true);
    try {
      await post(`/messes/${messId}/shared-bills/entries`, {
        categoryId: form.categoryId,
        amount: parseFloat(form.amount),
        month,
        year,
        note: form.note || undefined,
      });
      setShowForm(false);
      setForm({ categoryId: "", amount: "", note: "" });
      load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const total = entries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-[20px] text-[#F5ECD5]">
              {t("manager.sharedBills.title")}
            </h1>
            <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
              {month} {year}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/manager/shared-bills/history"
              className="w-9 h-9 bg-[rgba(245,236,213,0.15)] rounded-full flex items-center justify-center text-[#F5ECD5]"
            >
              <History size={18} />
            </Link>
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-9 h-9 bg-[#F0BB78] rounded-full flex items-center justify-center text-[#2C2F1E]"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[12px] p-4 mb-4 flex items-center justify-between">
          <span className="text-[13px] text-[#6B7550]">{t("manager.sharedBills.monthTotal")}</span>
          <span className="font-display font-bold text-[20px] text-[#626F47]">
            ৳{total.toLocaleString()}
          </span>
        </div>

        {actionError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700">
            {actionError}
          </div>
        )}

        {showForm && (
          <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-4 mb-4">
            <h3 className="font-semibold text-[14px] text-[#2C2F1E] mb-3">
              {t("manager.sharedBills.addEntry")}
            </h3>
            <div className="mb-3">
              <label className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-1.5 block">
                {t("manager.sharedBills.category")}
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[10px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47]"
              >
                <option value="">{t("manager.sharedBills.selectCategory")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {[
              { label: t("manager.sharedBills.amount"), key: "amount" as const, type: "number" },
              { label: t("manager.sharedBills.note"), key: "note" as const, type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key} className="mb-3">
                <label className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-1.5 block">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[10px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47]"
                />
              </div>
            ))}
            <button
              onClick={handleAdd}
              disabled={isSubmitting || !form.categoryId || !form.amount}
              className="w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[14px] py-[11px] rounded-[10px] disabled:opacity-60"
            >
              {isSubmitting ? t("manager.sharedBills.adding") : t("manager.sharedBills.add")}
            </button>
          </div>
        )}

        {isLoading ? (
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
                <div className="font-semibold text-[14px] text-[#2C2F1E]">{entry.categoryName}</div>
                {entry.note && (
                  <div className="text-[12px] text-[#6B7550]">{entry.note}</div>
                )}
              </div>
              <span className="font-display font-bold text-[15px] text-[#2C2F1E]">
                ৳{entry.amount.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
