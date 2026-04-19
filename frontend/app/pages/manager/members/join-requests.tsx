import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, UserCheck, UserX, Clock } from "lucide-react";
import { get } from "~/services/httpMethods/get";
import { post } from "~/services/httpMethods/post";
import { getErrorMessage } from "~/utils/errorHandler";
import { useAppSelector } from "~/redux/store/hooks";
import type { JoinRequest } from "~/types/mess.d";

export default function JoinRequestsPage() {
  const { t } = useTranslation();
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  function load() {
    if (!messId) return;
    setIsLoading(true);
    get<{ data: JoinRequest[] }>(`/messes/${messId}/join-requests`)
      .then((res) => setRequests(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (!messId) {
      setIsLoading(false);
      return;
    }
    load();
  }, [messId]);

  async function handleApprove(id: string) {
    if (!messId) return;
    setActionError(null);
    setActionLoading(id);
    try {
      await post(`/messes/${messId}/join-requests/${id}/approve`);
      load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: string) {
    if (!messId) return;
    const reason = prompt(t("manager.members.joinRequests.rejectPrompt"));
    if (!reason) return;
    setActionError(null);
    setActionLoading(id);
    try {
      await post(`/messes/${messId}/join-requests/${id}/reject`, { reason });
      load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="relative z-10">
          <Link
            to="/manager/members"
            className="flex items-center gap-2 text-[rgba(245,236,213,0.8)] text-[14px] mb-4"
          >
            <ArrowLeft size={18} /> {t("manager.members.joinRequests.back")}
          </Link>
          <h1 className="font-display font-bold text-[20px] text-[#F5ECD5]">
            {t("manager.members.joinRequests.title")}
          </h1>
          <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
            {t("manager.members.joinRequests.subtitle")}
          </p>
        </div>
      </div>

      <div className="px-4 pt-4">
        {actionError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700">
            {actionError}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-[rgba(98,111,71,0.1)] rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock size={28} className="text-[#A09070]" />
            </div>
            <p className="text-[14px] text-[#6B7550] font-semibold">
              {t("manager.members.joinRequests.noPending")}
            </p>
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4 mb-3 shadow-[0_1px_4px_rgba(74,60,30,0.06)]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#F0BB78] flex items-center justify-center font-display font-bold text-[16px] text-[#2C2F1E] shrink-0">
                  {req.userName[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px] text-[#2C2F1E]">
                    {req.userName}
                  </div>
                  <div className="text-[12px] text-[#6B7550]">
                    {req.userEmail}
                  </div>
                  <div className="text-[11px] text-[#A09070]">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span className="text-[10px] font-semibold bg-[rgba(240,187,120,0.18)] text-amber-700 px-2 py-0.5 rounded-full">
                  {t("manager.members.joinRequests.pending")}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(req.id)}
                  disabled={actionLoading === req.id}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#626F47] text-[#F5ECD5] font-semibold text-[13px] py-2.5 rounded-[10px] disabled:opacity-50"
                >
                  <UserCheck size={16} /> {t("manager.members.joinRequests.approve")}
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  disabled={actionLoading === req.id}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 border border-red-200 font-semibold text-[13px] py-2.5 rounded-[10px] disabled:opacity-50"
                >
                  <UserX size={16} /> {t("manager.members.joinRequests.reject")}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
