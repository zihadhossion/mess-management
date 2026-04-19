import { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
} from "lucide-react";
import {
  getMessRequests,
  approveMessRequest,
  rejectMessRequest,
} from "~/services/httpServices/adminService";
import { getErrorMessage } from "~/utils/errorHandler";
import type { MessCreationRequestAdmin } from "~/types/admin.d";
import { SelectDropdown } from "~/components/ui/SelectDropdown";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING_APPROVAL", label: "Pending" },
  { value: "ACTIVE", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const STATUS_LABEL: Record<string, string> = {
  PENDING_APPROVAL: "Pending",
  ACTIVE: "Approved",
  REJECTED: "Rejected",
  INACTIVE: "Inactive",
};

const STATUS_STYLE: Record<string, string> = {
  PENDING_APPROVAL: "bg-amber-50 text-amber-700",
  ACTIVE: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-600",
  INACTIVE: "bg-gray-50 text-gray-600",
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function exportCSV(rows: MessCreationRequestAdmin[], filename = "mess-requests.csv") {
  const cols = ["Mess Name", "Manager", "Email", "Currency", "Status", "Submitted At"];
  const body = rows.map((r) =>
    [r.messName, r.managerName, r.managerEmail, r.currency, r.status, formatDate(r.createdAt)]
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

export default function AdminMessRequestsPage() {
  const [requests, setRequests] = useState<MessCreationRequestAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("PENDING_APPROVAL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [rejectTarget, setRejectTarget] = useState<MessCreationRequestAdmin | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [detailTarget, setDetailTarget] = useState<MessCreationRequestAdmin | null>(null);

  function load() {
    setIsLoading(true);
    setLoadError(null);
    getMessRequests({
      status: statusFilter || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
    })
      .then((res) => {
        const payload = res.data.data;
        const rows = Array.isArray(payload) ? payload : [];
        setRequests(rows);
        setPage(1);
      })
      .catch((err) => setLoadError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, [statusFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(requests.length / pageSize));
  const paginated = requests.slice((page - 1) * pageSize, page * pageSize);

  async function handleApprove(id: string) {
    setActionError(null);
    setActionLoading(id);
    try {
      await approveMessRequest(id);
      load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRejectConfirm() {
    if (!rejectTarget || !rejectNote.trim()) return;
    setActionError(null);
    setActionLoading(rejectTarget.id);
    try {
      await rejectMessRequest(rejectTarget.id, rejectNote.trim());
      setRejectTarget(null);
      setRejectNote("");
      load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#2C2F1E]">Mess Requests</h1>
          <p className="text-base text-[#6B7550]">Mess creation applications — review and approve or reject</p>
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
          <label className="block text-[13px] font-semibold text-[#6B7550] mb-1">Status</label>
          <SelectDropdown value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </SelectDropdown>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-[13px] font-semibold text-[#6B7550] mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full border border-[#D9CEB4] rounded-[10px] px-3 py-2 text-[15px] text-[#2C2F1E] outline-none focus:border-[#626F47]"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-[13px] font-semibold text-[#6B7550] mb-1">To Date</label>
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
          onClick={() => { setStatusFilter("PENDING_APPROVAL"); setFromDate(""); setToDate(""); }}
          className="px-4 py-2 rounded-[10px] border border-[#D9CEB4] text-[15px] text-[#6B7550] font-semibold hover:bg-[#FAF7F0] transition-colors"
        >
          Reset
        </button>
      </div>

      {actionError && (
        <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[12px] text-[15px] text-red-700">
          {actionError}
        </div>
      )}

      {!isLoading && !loadError && (
        <p className="text-[14px] text-[#6B7550] mb-3">
          {requests.length} request{requests.length !== 1 ? "s" : ""}
        </p>
      )}

      {isLoading ? (
        <div role="status" className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : loadError ? (
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-[12px] text-[15px] text-red-700">{loadError}</div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={32} className="text-[#A09070] mx-auto mb-3" />
          <p className="text-[17px] text-[#6B7550] font-semibold">No requests found</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-[#E8E0D0] rounded-[16px] overflow-hidden shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F0EBE0] bg-[#FAF7F0]">
                  {["Mess Name", "Manager", "Currency", "Submitted At", "Status", "Actions"].map((col) => (
                    <th key={col} className="px-5 py-3 text-[13px] font-semibold text-[#6B7550] uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((req, i) => (
                  <tr
                    key={req.id}
                    className={`border-b border-[#F0EBE0] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#FDFAF5]"}`}
                  >
                    <td className="px-5 py-3">
                      <div className="font-semibold text-[15px] text-[#2C2F1E]">{req.messName}</div>
                      {req.address && <div className="text-[12px] text-[#A09070] mt-0.5">{req.address}</div>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-[15px] text-[#2C2F1E]">{req.managerName}</div>
                      <div className="text-[12px] text-[#6B7550]">{req.managerEmail}</div>
                    </td>
                    <td className="px-5 py-3 text-[15px] text-[#6B7550]">{req.currency}</td>
                    <td className="px-5 py-3 text-[15px] text-[#6B7550]">{formatDate(req.createdAt)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[13px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[req.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABEL[req.status] ?? req.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDetailTarget(req)}
                          className="p-1.5 rounded-[6px] text-[#6B7550] hover:bg-[#F0EBE0] transition-colors"
                          title="View details"
                        >
                          <Eye size={15} />
                        </button>
                        {req.status === "PENDING_APPROVAL" && (
                          <>
                            <button
                              onClick={() => handleApprove(req.id)}
                              disabled={actionLoading === req.id}
                              className="p-1.5 rounded-[6px] text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle size={15} />
                            </button>
                            <button
                              onClick={() => { setRejectTarget(req); setRejectNote(""); }}
                              disabled={actionLoading === req.id}
                              className="p-1.5 rounded-[6px] text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-[14px] text-[#6B7550]">Page {page} of {totalPages}</p>
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

      {/* Detail modal */}
      {detailTarget && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl text-[#2C2F1E]">{detailTarget.messName}</h2>
              <button onClick={() => setDetailTarget(null)} className="text-[#A09070] hover:text-[#2C2F1E]">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Manager", value: detailTarget.managerName },
                  { label: "Email", value: detailTarget.managerEmail },
                  { label: "Currency", value: detailTarget.currency },
                  { label: "Submitted", value: formatDate(detailTarget.createdAt) },
                  { label: "Status", value: STATUS_LABEL[detailTarget.status] ?? detailTarget.status },
                  { label: "Address", value: detailTarget.address ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-[12px] font-semibold text-[#6B7550] uppercase tracking-wider mb-0.5">{label}</div>
                    <div className="text-[15px] text-[#2C2F1E] capitalize">{value}</div>
                  </div>
                ))}
              </div>

              {detailTarget.description && (
                <div>
                  <div className="text-[12px] font-semibold text-[#6B7550] uppercase tracking-wider mb-1">Description</div>
                  <p className="text-[15px] text-[#2C2F1E]">{detailTarget.description}</p>
                </div>
              )}

              {detailTarget.reviewNote && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-[10px]">
                  <div className="text-[12px] font-semibold text-amber-700 uppercase tracking-wider mb-1">Review Note</div>
                  <p className="text-[14px] text-amber-800">{detailTarget.reviewNote}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDetailTarget(null)}
                className="flex-1 py-2.5 rounded-[10px] border border-[#D9CEB4] text-[#6B7550] font-semibold text-[15px]"
              >
                Close
              </button>
              {detailTarget.status === "PENDING_APPROVAL" && (
                <>
                  <button
                    onClick={() => { handleApprove(detailTarget.id); setDetailTarget(null); }}
                    disabled={!!actionLoading}
                    className="flex-1 py-2.5 rounded-[10px] bg-[#626F47] text-white font-semibold text-[15px] disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => { setDetailTarget(null); setRejectTarget(detailTarget); setRejectNote(""); }}
                    disabled={!!actionLoading}
                    className="flex-1 py-2.5 rounded-[10px] bg-red-600 text-white font-semibold text-[15px] disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl text-[#2C2F1E]">Reject Mess Request</h2>
              <button onClick={() => setRejectTarget(null)} className="text-[#A09070] hover:text-[#2C2F1E]">
                <X size={20} />
              </button>
            </div>
            <p className="text-[15px] text-[#6B7550] mb-4">
              Rejecting <strong>{rejectTarget.messName}</strong> by {rejectTarget.managerName}. Provide a reason:
            </p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              placeholder="e.g. Incomplete information, duplicate request..."
              className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-3 text-base text-[#2C2F1E] outline-none focus:border-[#626F47] resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectTarget(null)}
                className="flex-1 py-2.5 rounded-[10px] border border-[#D9CEB4] text-[#6B7550] font-semibold text-[15px]"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectNote.trim() || !!actionLoading}
                className="flex-1 py-2.5 rounded-[10px] bg-red-600 text-white font-semibold text-[15px] disabled:opacity-50"
              >
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
