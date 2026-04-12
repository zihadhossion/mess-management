import { useEffect, useState } from "react";
import { FileText, CheckCircle, XCircle, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchPendingMessRequests } from "~/redux/features/adminSlice";
import {
  approveMessRequest,
  rejectMessRequest,
} from "~/services/httpServices/adminService";
import { getErrorMessage } from "~/utils/errorHandler";
import type { MessCreationRequestAdmin } from "~/types/admin.d";

export default function AdminMessRequestsPage() {
  const dispatch = useAppDispatch();
  const { pendingMessRequests, isLoading } = useAppSelector((s) => s.admin);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] =
    useState<MessCreationRequestAdmin | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    dispatch(fetchPendingMessRequests());
  }, [dispatch]);

  async function handleApprove(id: string) {
    setActionError(null);
    setActionLoading(id);
    try {
      await approveMessRequest(id);
      dispatch(fetchPendingMessRequests());
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
      dispatch(fetchPendingMessRequests());
      setRejectTarget(null);
      setRejectNote("");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-[24px] text-[#2C2F1E]">
          Mess Requests
        </h1>
        <p className="text-[14px] text-[#6B7550]">
          Pending mess creation applications
        </p>
      </div>

      {actionError && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[12px] text-[13px] text-red-700"
        >
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div
          role="status"
          aria-label="Loading requests"
          className="flex justify-center py-16"
        >
          <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pendingMessRequests.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={32} className="text-[#A09070] mx-auto mb-3" />
          <p className="text-[15px] text-[#6B7550] font-semibold">
            No pending requests
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingMessRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)]"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-bold text-[16px] text-[#2C2F1E]">
                    {req.messName}
                  </h3>
                  <p className="text-[13px] text-[#6B7550]">
                    by {req.managerName} · {req.managerEmail}
                  </p>
                </div>
                <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                  Pending
                </span>
              </div>
              {req.description && (
                <p className="text-[13px] text-[#6B7550] mb-2">
                  {req.description}
                </p>
              )}
              {req.address && (
                <p className="text-[12px] text-[#A09070] mb-3">
                  📍 {req.address}
                </p>
              )}
              <div className="flex gap-3 pt-3 border-t border-[#F0EBE0]">
                <button
                  onClick={() => handleApprove(req.id)}
                  disabled={actionLoading === req.id}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#626F47] text-[#F5ECD5] font-semibold text-[13px] py-2.5 rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={16} /> Approve
                </button>
                <button
                  onClick={() => {
                    setRejectTarget(req);
                    setRejectNote("");
                  }}
                  disabled={actionLoading === req.id}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 font-semibold text-[13px] py-2.5 rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
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
                className="font-display font-bold text-[18px] text-[#2C2F1E]"
              >
                Reject Mess Request
              </h2>
              <button
                aria-label="Close dialog"
                onClick={() => setRejectTarget(null)}
                className="text-[#A09070] hover:text-[#2C2F1E]"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-[13px] text-[#6B7550] mb-4">
              Rejecting <strong>{rejectTarget.messName}</strong> by{" "}
              {rejectTarget.managerName}. Provide a reason:
            </p>
            <textarea
              id="reject-note"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              placeholder="e.g. Incomplete information, duplicate request..."
              className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-3 text-[14px] text-[#2C2F1E] outline-none focus:border-[#626F47] resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectTarget(null)}
                className="flex-1 py-2.5 rounded-[10px] border border-[#D9CEB4] text-[#6B7550] font-semibold text-[13px]"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectNote.trim() || !!actionLoading}
                className="flex-1 py-2.5 rounded-[10px] bg-red-600 text-white font-semibold text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
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
