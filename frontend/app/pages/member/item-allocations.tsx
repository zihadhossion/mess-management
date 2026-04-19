import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Package } from "lucide-react";
import { get } from "~/services/httpMethods/get";
import { useAppSelector } from "~/redux/store/hooks";
import { getErrorMessage } from "~/utils/errorHandler";
import { format } from "date-fns";
import type { ItemAllocation } from "~/types/member.d";

export default function ItemAllocationsPage() {
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const { t } = useTranslation();
  const [allocations, setAllocations] = useState<ItemAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));

  useEffect(() => {
    if (!messId) return;
    setIsLoading(true);
    setFetchError(null);
    get<{ data: ItemAllocation[] }>(`/messes/${messId}/item-allocations`, { month })
      .then((res) => setAllocations(res.data))
      .catch((err) => setFetchError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [month, messId]);

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="relative z-10">
          <h1 className="font-display font-bold text-[20px] text-[#F5ECD5]">
            {t("member.allocations.title")}
          </h1>
          <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
            {t("member.allocations.subtitle")}
          </p>
        </div>
      </div>

      <div className="px-4 pt-4 md:max-w-3xl md:mx-auto">
        {/* Month picker */}
        <div className="relative mb-4">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full border border-[#D9CEB4] rounded-[12px] px-4 py-3 text-[14px] text-[#2C2F1E] bg-[#FBF5E8] outline-none focus:border-[#626F47]"
          />
        </div>

        {isLoading ? (
          <div
            role="status"
            aria-label={t("member.allocations.loading")}
            className="flex justify-center py-10"
          >
            <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : fetchError ? (
          <div
            role="alert"
            className="text-center py-12 p-4 bg-red-50 border border-red-200 rounded-[12px] text-[13px] text-red-700"
          >
            {fetchError}
          </div>
        ) : allocations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-[rgba(98,111,71,0.1)] rounded-full flex items-center justify-center mx-auto mb-3">
              <Package size={28} className="text-[#A09070]" />
            </div>
            <p className="text-[14px] text-[#6B7550] font-semibold">
              {t("member.allocations.noData")}
            </p>
            <p className="text-[12px] text-[#A09070] mt-1">
              {t("member.allocations.noDataDesc")}
            </p>
          </div>
        ) : (
          allocations.map((alloc) => (
            <div
              key={alloc.id}
              className="flex items-center gap-3 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[12px] p-3.5 mb-2.5"
            >
              <div className="w-9 h-9 bg-[rgba(98,111,71,0.1)] rounded-[9px] flex items-center justify-center shrink-0">
                <Package size={18} className="text-[#626F47]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px] text-[#2C2F1E]">
                  {alloc.itemTypeName}
                </div>
                <div className="text-[12px] text-[#6B7550]">{alloc.date}</div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-[15px] text-[#2C2F1E]">
                  {alloc.quantity}
                </div>
                <div className="text-[11px] text-[#6B7550]">{alloc.unit}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
