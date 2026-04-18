import { useEffect, useState } from "react";
import { Users, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { getJoinRequests } from "~/services/httpServices/adminService";
import { getErrorMessage } from "~/utils/errorHandler";
import type { JoinRequest } from "~/types/admin.d";
import { SelectDropdown } from "~/components/ui/SelectDropdown";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
  expired: "bg-gray-100 text-gray-500",
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function exportCSV(rows: JoinRequest[], filename = "join-requests.csv") {
  const cols = ["Member", "Email", "Mess", "Requested At", "Status"];
  const body = rows.map((r) =>
    [r.memberName, r.memberEmail, r.messName, formatDate(r.createdAt), r.status]
      .map((v) => (String(v).includes(",") ? `"${v}"` : v))
      .join(","),
  );
  const csv = [cols.join(","), ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminJoinRequestsPage() {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  function load() {
    setIsLoading(true);
    setLoadError(null);
    getJoinRequests({
      status: statusFilter || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
    })
      .then((res) => {
        const payload = res.data.data;
        const rows = Array.isArray(payload) ? payload : payload.data ?? [];
        const count = Array.isArray(payload) ? rows.length : payload.total ?? rows.length;
        setRequests(rows);
        setTotal(count);
        setPage(1);
      })
      .catch((err) => setLoadError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, [statusFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginated = requests.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#2C2F1E]">
            Join Requests
          </h1>
          <p className="text-base text-[#6B7550]">
            Platform-wide member join requests — read-only oversight
          </p>
        </div>
        <button
          onClick={() => exportCSV(requests)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D9CEB4] rounded-[10px] text-[14px] font-semibold text-[#6B7550] hover:bg-[#FAF7F0] transition-colors"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E8E0D0] rounded-[16px] p-4 mb-5 flex flex-wrap gap-3 items-end shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-[13px] font-semibold text-[#6B7550] mb-1">
            Status
          </label>
          <SelectDropdown
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </SelectDropdown>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-[13px] font-semibold text-[#6B7550] mb-1">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full border border-[#D9CEB4] rounded-[10px] px-3 py-2 text-[15px] text-[#2C2F1E] outline-none focus:border-[#626F47]"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-[13px] font-semibold text-[#6B7550] mb-1">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border border-[#D9CEB4] rounded-[10px] px-3 py-2 text-[15px] text-[#2C2F1E] outline-none focus:border-[#626F47]"
          />
        </div>
        <SelectDropdown value={String(pageSize)} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
          {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n} / page</option>)}
        </SelectDropdown>
        <button
          onClick={() => { setStatusFilter(""); setFromDate(""); setToDate(""); }}
          className="px-4 py-2 rounded-[10px] border border-[#D9CEB4] text-[15px] text-[#6B7550] font-semibold hover:bg-[#FAF7F0] transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Total count */}
      {!isLoading && !loadError && (
        <p className="text-[14px] text-[#6B7550] mb-3">
          {total} join request{total !== 1 ? "s" : ""}
        </p>
      )}

      {isLoading ? (
        <div
          role="status"
          aria-label="Loading join requests"
          className="flex justify-center py-16"
        >
          <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : loadError ? (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 rounded-[12px] text-[15px] text-red-700"
        >
          {loadError}
        </div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-16">
          <Users size={32} className="text-[#A09070] mx-auto mb-3" />
          <p className="text-[17px] text-[#6B7550] font-semibold">
            No join requests found
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-[#E8E0D0] rounded-[16px] overflow-hidden shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F0EBE0] bg-[#FAF7F0]">
                  {["Member", "Email", "Mess", "Requested At", "Status"].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-5 py-3 text-[13px] font-semibold text-[#6B7550] uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {paginated.map((req, i) => (
                  <tr
                    key={req.id}
                    className={`border-b border-[#F0EBE0] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#FDFAF5]"}`}
                  >
                    <td className="px-5 py-3 text-[15px] font-semibold text-[#2C2F1E]">
                      {req.memberName}
                    </td>
                    <td className="px-5 py-3 text-[15px] text-[#6B7550]">
                      {req.memberEmail}
                    </td>
                    <td className="px-5 py-3 text-[15px] text-[#2C2F1E]">
                      {req.messName}
                    </td>
                    <td className="px-5 py-3 text-[15px] text-[#6B7550]">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[13px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[req.status] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-[14px] text-[#6B7550]">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-[9px] border border-[#D9CEB4] text-[#6B7550] disabled:opacity-40 hover:bg-[#FAF7F0] transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-[9px] border border-[#D9CEB4] text-[#6B7550] disabled:opacity-40 hover:bg-[#FAF7F0] transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
