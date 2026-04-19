import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Users, UserPlus, Trash2, Shield } from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchMembers } from "~/redux/features/memberSlice";
import { del } from "~/services/httpMethods/delete";
import { post } from "~/services/httpMethods/post";
import { getErrorMessage } from "~/utils/errorHandler";
import { Role } from "~/enums/role.enum";
import { useAuth } from "~/hooks/useAuth";
import toast from "react-hot-toast";

export default function ManagerMembersPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { members, isLoading } = useAppSelector((s) => s.member);
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMembers());
  }, [dispatch]);

  async function handleRemove(memberId: string) {
    if (!confirm(t("manager.members.removeConfirm"))) return;
    setActionError(null);
    setActionLoading(memberId + "-remove");
    try {
      await del(`/members/${memberId}`);
      dispatch(fetchMembers());
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAssignCoManager(memberId: string) {
    if (!messId) return;
    if (!confirm(t("manager.members.coManagerConfirm"))) return;
    setActionLoading(memberId + "-co");
    try {
      await post(`/messes/${messId}/members/${memberId}/assign-co-manager`, {});
      toast.success(t("manager.members.coManagerSuccess"));
      dispatch(fetchMembers());
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
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-[length:var(--fs-2xl)] text-[#F5ECD5]">
              {t("manager.members.title")}
            </h1>
            <p className="text-[length:var(--fs-md)] text-[rgba(245,236,213,0.72)]">
              {t("manager.members.totalMembers", { count: members.length })}
            </p>
          </div>
          <Link
            to="/manager/members/join-requests"
            className="flex items-center gap-1.5 bg-[#F0BB78] text-[#2C2F1E] font-semibold text-[length:var(--fs-sm)] px-3 py-1.5 rounded-full"
          >
            <UserPlus size={14} /> {t("manager.members.requests")}
          </Link>
        </div>
      </div>

      <div className="px-4 pt-4">
        {actionError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[length:var(--fs-md)] text-red-700">
            {actionError}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-[rgba(98,111,71,0.1)] rounded-full flex items-center justify-center mx-auto mb-3">
              <Users size={28} className="text-[#A09070]" />
            </div>
            <p className="text-[length:var(--fs-base)] text-[#6B7550] font-semibold">
              {t("manager.members.noMembers")}
            </p>
            <p className="text-[length:var(--fs-sm)] text-[#A09070] mt-1">
              {t("manager.members.noMembersDesc")}
            </p>
          </div>
        ) : (
          members.map((m) => {
            const isMe = m.userId === user?.id;
            const isManager = m.role === Role.MANAGER;
            const canPromote = !isMe && !isManager && m.isActive;

            return (
              <div
                key={m.id}
                className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4 mb-3 shadow-[0_1px_4px_rgba(74,60,30,0.06)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F0BB78] flex items-center justify-center font-display font-bold text-[length:var(--fs-lg)] text-[#2C2F1E] shrink-0">
                    {m.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[length:var(--fs-base)] text-[#2C2F1E]">{m.name}</span>
                      {isManager && (
                        <span className="text-[length:var(--fs-2xs)] font-semibold bg-[rgba(98,111,71,0.15)] text-[#626F47] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Shield size={9} /> {t("manager.members.manager")}
                        </span>
                      )}
                    </div>
                    <div className="text-[length:var(--fs-sm)] text-[#6B7550]">{m.email}</div>
                    <div className="text-[length:var(--fs-xs)] text-[#A09070]">
                      {t("manager.members.joined", { date: new Date(m.joinedAt).toLocaleDateString() })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[length:var(--fs-2xs)] font-semibold px-2 py-0.5 rounded-full ${m.isActive ? "bg-[rgba(98,111,71,0.12)] text-[#626F47]" : "bg-[#F0F0E8] text-[#A09070]"}`}
                    >
                      {m.isActive ? t("manager.members.active") : t("manager.members.inactive")}
                    </span>
                    {canPromote && (
                      <button
                        onClick={() => handleAssignCoManager(m.id)}
                        disabled={actionLoading === m.id + "-co"}
                        title={t("manager.members.makeCoManager")}
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center bg-[rgba(98,111,71,0.1)] text-[#626F47] disabled:opacity-50"
                      >
                        <Shield size={14} />
                      </button>
                    )}
                    {!isMe && (
                      <button
                        onClick={() => handleRemove(m.id)}
                        disabled={actionLoading === m.id + "-remove"}
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center bg-red-50 text-red-500 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
