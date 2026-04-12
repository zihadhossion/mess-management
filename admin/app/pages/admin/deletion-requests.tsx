import { useEffect, useState } from "react";
import { Trash2, CheckCircle, XCircle } from "lucide-react";
import {
  getDeletionRequests,
  approveDeletionRequest,
  rejectDeletionRequest,
} from "~/services/httpServices/adminService";
import { getErrorMessage } from "~/utils/errorHandler";
import type { MessDeletionRequest } from "~/types/admin.d";

export default function AdminDeletionRequestsPage() {
  const [requests, setRequests] = useState<MessDeletionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function load() {
    setIsLoading(true);
    setLoadError(null);
    getDeletionRequests()
      .then((res) => setRequests(res.data))
      .catch((err) => setLoadError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAction(id: string, action: "approve" | "reject") {
    setActionError(null);
    setActionLoading(id);
    try {
      if (action === "approve") {
        await approveDeletionRequest(id);
      } else {
        await rejectDeletionRequest(id);
      }
      load();
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
          Deletion Requests
        </h1>
        <p className="text-[14px] text-[#6B7550]">
          Mess deletion requests from managers
        </p>
      </div>

      {actionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[12px] text-[13px] text-red-700">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div
          role="status"
          aria-label="Loading deletion requests"
          className="flex justify-center py-16"
        >
          <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : loadError ? (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 rounded-[12px] text-[13px] text-red-700"
        >
          {loadError}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <Trash2 size={32} className="text-[#A09070] mx-auto mb-3" />
          <p className="text-[15px] text-[#6B7550] font-semibold">
            No deletion requests
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
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
                    Requested by {req.managerName}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    req.status === "pending"
                      ? "bg-amber-50 text-amber-700"
                      : req.status === "approved"
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {req.status}
                </span>
              </div>
              <div className="bg-[#FAF7F0] rounded-[10px] p-3 mb-3">
                <p className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-wider mb-1">
                  Reason
                </p>
                <p className="text-[13px] text-[#2C2F1E]">{req.reason}</p>
              </div>
              {req.status === "pending" && (
                <div className="flex gap-3 pt-3 border-t border-[#F0EBE0]">
                  <button
                    onClick={() => handleAction(req.id, "approve")}
                    disabled={actionLoading === req.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-semibold text-[13px] py-2.5 rounded-[10px] disabled:opacity-50"
                  >
                    <CheckCircle size={16} /> Approve Deletion
                  </button>
                  <button
                    onClick={() => handleAction(req.id, "reject")}
                    disabled={actionLoading === req.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#626F47] text-[#F5ECD5] font-semibold text-[13px] py-2.5 rounded-[10px] disabled:opacity-50"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
