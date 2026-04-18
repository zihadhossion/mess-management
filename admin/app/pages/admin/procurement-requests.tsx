import { useEffect, useState } from "react";
import { ShoppingCart, CheckCircle, XCircle, X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getProcurementRequests,
  approveProcurementRequest,
  rejectProcurementRequest,
} from "~/services/httpServices/adminService";
import { getErrorMessage } from "~/utils/errorHandler";
import type { ProcurementRequest } from "~/types/admin.d";
import { SelectDropdown } from "~/components/ui/SelectDropdown";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function exportCSV(rows: ProcurementRequest[], filename = "procurement-requests.csv") {
  const cols = ["Mess", "Manager", "Description", "Submitted", "Status"];
  const body = rows.map((r) =>
    [r.messName, r.managerName, r.description, formatDate(r.createdAt), r.status]
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

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminProcurementRequestsPage() {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rejectTarget, setRejectTarget] = useState<ProcurementRequest | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [detailTarget, setDetailTarget] = useState<ProcurementRequest | null>(null);

  function load() {
    setIsLoading(true);
    setLoadError(null);
    getProcurementRequests({ status: statusFilter || undefined })
      .then((res) => {
        const payload = res.data.data;
        const rows = Array.isArray(payload) ? payload : payload.data ?? [];
        const count = Array.isArray(payload) ? rows.length : payload.total ?? rows.length;
        setRequests(rows);
        setTotal(count);
      })
      .catch((err) => setLoadError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function handleApprove(id: string) {
    setActionError(null);
    setActionLoading(id);
    try {
      await approveProcurementRequest(id);
      load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRejectConfirm() {
    if (!rejectTarget) return;
    setActionError(null);
    setActionLoading(rejectTarget.id);
    try {
      await rejectProcurementRequest(rejectTarget.id, rejectNotes.trim() || undefined);
      setRejectTarget(null);
      setRejectNotes("");
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
          <h1 className="font-display font-bold text-[26px] text-[#2C2F1E]">
            Procurement Requests
          </h1>
          <p className="text-base text-[#6B7550]">
            Review and action procurement requests from mess managers
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
        <div className="flex-1 min-w-[180px]">
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
        <SelectDropdown value={String(pageSize)} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
          {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n} / page</option>)}
        </SelectDropdown>
        <button
          onClick={() => setStatusFilter("")}
          className="px-4 py-2 rounded-[10px] border border-[#D9CEB4] text-[15px] text-[#6B7550] font-semibold hover:bg-[#FAF7F0] transition-colors"
        >
          Reset
        </button>
      </div>

      {actionError && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[12px] text-[15px] text-red-700"
        >
          {actionError}
        </div>
      )}

      {!isLoading && !loadError && (
        <p className="text-[14px] text-[#6B7550] mb-3">
          {total} procurement request{total !== 1 ? "s" : ""}
        </p>
      )}

      {isLoading ? (
        <div
          role="status"
          aria-label="Loading procurement requests"
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
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart size={32} className="text-[#A09070] mx-auto mb-3" />
          <p className="text-[17px] text-[#6B7550] font-semibold">
            No procurement requests found
          </p>
        </div>
      ) : (
        <>
        <div className="bg-white border border-[#E8E0D0] rounded-[16px] overflow-hidden shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#F0EBE0] bg-[#FAF7F0]">
                {["Mess", "Manager", "Description", "Submitted", "Status", "Actions"].map(
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
              {requests.slice((page - 1) * pageSize, page * pageSize).map((req, i) => (
                <tr
                  key={req.id}
                  className={`border-b border-[#F0EBE0] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#FDFAF5]"}`}
                >
                  <td className="px-5 py-3 text-[15px] font-semibold text-[#2C2F1E]">
                    {req.messName}
                  </td>
                  <td className="px-5 py-3 text-[15px] text-[#6B7550]">
                    {req.managerName}
                  </td>
                  <td className="px-5 py-3 text-[15px] text-[#2C2F1E] max-w-[220px] truncate">
                    <button
                      onClick={() => setDetailTarget(req)}
                      className="text-[#626F47] hover:underline text-left"
                      title={req.description}
                    >
                      {req.description}
                    </button>
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
                  <td className="px-5 py-3">
                    {req.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(req.id)}
                          disabled={actionLoading === req.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#626F47] text-[#F5ECD5] text-[13px] font-semibold rounded-[8px] disabled:opacity-50"
                        >
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button
                          onClick={() => {
                            setRejectTarget(req);
                            setRejectNotes("");
                          }}
                          disabled={actionLoading === req.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-[13px] font-semibold rounded-[8px] disabled:opacity-50"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDetailTarget(req)}
                        className="text-[13px] text-[#626F47] font-semibold hover:underline"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {Math.ceil(total / pageSize) > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-[14px] text-[#6B7550]">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
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
                onClick={() => setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))}
                disabled={page >= Math.ceil(total / pageSize)}
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
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-dialog-title"
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-[20px] p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2
                id="detail-dialog-title"
                className="font-display font-bold text-xl text-[#2C2F1E]"
              >
                Procurement Request Detail
              </h2>
              <button
                aria-label="Close dialog"
                onClick={() => setDetailTarget(null)}
                className="text-[#A09070] hover:text-[#2C2F1E]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-[15px]">
              <div className="flex justify-between">
                <span className="text-[#6B7550] font-semibold">Mess</span>
                <span className="text-[#2C2F1E]">{detailTarget.messName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7550] font-semibold">Manager</span>
                <span className="text-[#2C2F1E]">{detailTarget.managerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7550] font-semibold">Status</span>
                <span
                  className={`text-[13px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[detailTarget.status] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {detailTarget.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7550] font-semibold">Submitted</span>
                <span className="text-[#2C2F1E]">{formatDate(detailTarget.createdAt)}</span>
              </div>
              <div>
                <p className="text-[#6B7550] font-semibold mb-1">Description</p>
                <p className="bg-[#FAF7F0] rounded-[10px] p-3 text-[#2C2F1E]">
                  {detailTarget.description}
                </p>
              </div>
              {detailTarget.notes && (
                <div>
                  <p className="text-[#6B7550] font-semibold mb-1">Admin Notes</p>
                  <p className="bg-[#FAF7F0] rounded-[10px] p-3 text-[#2C2F1E]">
                    {detailTarget.notes}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setDetailTarget(null)}
              className="mt-5 w-full py-2.5 rounded-[10px] border border-[#D9CEB4] text-[#6B7550] font-semibold text-[15px] hover:bg-[#FAF7F0] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-dialog-title"
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-[20px] p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2
                id="reject-dialog-title"
                className="font-display font-bold text-xl text-[#2C2F1E]"
              >
                Reject Procurement Request
              </h2>
              <button
                aria-label="Close dialog"
                onClick={() => setRejectTarget(null)}
                className="text-[#A09070] hover:text-[#2C2F1E]"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-[15px] text-[#6B7550] mb-4">
              Rejecting request from <strong>{rejectTarget.managerName}</strong> (
              {rejectTarget.messName}). Add optional notes:
            </p>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={3}
              placeholder="Optional rejection notes..."
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
                disabled={!!actionLoading}
                className="flex-1 py-2.5 rounded-[10px] bg-red-600 text-white font-semibold text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
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
