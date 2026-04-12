import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchMembers } from "~/redux/features/memberSlice";
import { del } from "~/services/httpMethods/delete";
import { getErrorMessage } from "~/utils/errorHandler";

export default function ManagerMembersPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { members, isLoading } = useAppSelector((s) => s.member);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMembers());
  }, [dispatch]);

  async function handleRemove(memberId: string) {
    if (!confirm(t("manager.members.removeConfirm"))) return;
    setActionError(null);
    try {
      await del(`/members/${memberId}`);
      dispatch(fetchMembers());
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-[20px] text-[#F5ECD5]">
              {t("manager.members.title")}
            </h1>
            <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
              {t("manager.members.totalMembers", { count: members.length })}
            </p>
          </div>
          <Link
            to="/manager/members/join-requests"
            className="flex items-center gap-1.5 bg-[#F0BB78] text-[#2C2F1E] font-semibold text-[12px] px-3 py-1.5 rounded-full"
          >
            <UserPlus size={14} /> {t("manager.members.requests")}
          </Link>
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
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-[rgba(98,111,71,0.1)] rounded-full flex items-center justify-center mx-auto mb-3">
              <Users size={28} className="text-[#A09070]" />
            </div>
            <p className="text-[14px] text-[#6B7550] font-semibold">
              {t("manager.members.noMembers")}
            </p>
            <p className="text-[12px] text-[#A09070] mt-1">
              {t("manager.members.noMembersDesc")}
            </p>
          </div>
        ) : (
          members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4 mb-3 shadow-[0_1px_4px_rgba(74,60,30,0.06)]"
            >
              <div className="w-10 h-10 rounded-full bg-[#F0BB78] flex items-center justify-center font-display font-bold text-[16px] text-[#2C2F1E] shrink-0">
                {m.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px] text-[#2C2F1E]">{m.name}</div>
                <div className="text-[12px] text-[#6B7550]">{m.email}</div>
                <div className="text-[11px] text-[#A09070]">
                  {t("manager.members.joined", { date: new Date(m.joinedAt).toLocaleDateString() })}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.isActive ? "bg-[rgba(98,111,71,0.12)] text-[#626F47]" : "bg-[#F0F0E8] text-[#A09070]"}`}
                >
                  {m.isActive ? t("manager.members.active") : t("manager.members.inactive")}
                </span>
                <button
                  onClick={() => handleRemove(m.id)}
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center bg-red-50 text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
