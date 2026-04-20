import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Copy, ChevronRight, UtensilsCrossed, UserCheck, MessageSquare } from "lucide-react";
import { useAuth } from "~/hooks/useAuth";
import { LanguageSwitcher } from "~/components/atoms/LanguageSwitcher";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchMembers, toggleMealParticipation } from "~/redux/features/memberSlice";
import { patch } from "~/services/httpMethods/patch";
import toast from "react-hot-toast";

export default function ManagerSettingsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const mess = useAppSelector((s) => s.mess.mess);
  const members = useAppSelector((s) => s.member.members);
  const [isToggling, setIsToggling] = useState(false);
  const [isTogglingApproval, setIsTogglingApproval] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(mess?.requiresJoinApproval ?? false);

  useEffect(() => {
    if (!mess?.id || members.length > 0) return;
    dispatch(fetchMembers());
  }, [dispatch, mess?.id, members.length]);

  useEffect(() => {
    if (mess?.requiresJoinApproval !== undefined) {
      setRequiresApproval(mess.requiresJoinApproval);
    }
  }, [mess?.requiresJoinApproval]);

  const myMember = members.find((m) => m.userId === user?.id);
  const participates = myMember?.participatesInMeals ?? true;

  async function handleToggle() {
    if (!myMember || isToggling) return;
    setIsToggling(true);
    await dispatch(
      toggleMealParticipation({
        memberId: myMember.id,
        participatesInMeals: !participates,
      }),
    );
    setIsToggling(false);
  }

  async function handleToggleApproval() {
    if (!mess || isTogglingApproval) return;
    setIsTogglingApproval(true);
    const newVal = !requiresApproval;
    try {
      await patch(`/messes/${mess.id}`, { requiresJoinApproval: newVal });
      setRequiresApproval(newVal);
    } catch {
      toast.error(t("common.error"));
    } finally {
      setIsTogglingApproval(false);
    }
  }

  function copyCode() {
    if (user?.messCode) {
      navigator.clipboard.writeText(user.messCode);
    }
  }

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="font-display font-bold text-[length:var(--fs-2xl)] text-[#F5ECD5]">
              {t("manager.settings.title")}
            </h1>
            <p className="text-[length:var(--fs-md)] text-[rgba(245,236,213,0.72)]">
              {t("manager.settings.subtitle")}
            </p>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Mess info */}
        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-5 mb-4">
          <h3 className="font-display font-bold text-[length:var(--fs-lg)] text-[#2C2F1E] mb-3">
            {t("manager.settings.messInfo")}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[length:var(--fs-md)] text-[#6B7550]">{t("manager.settings.messName")}</span>
              <span className="text-[length:var(--fs-md)] font-semibold text-[#2C2F1E]">
                {user?.messName ?? "—"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[length:var(--fs-md)] text-[#6B7550]">{t("manager.settings.messCode")}</span>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-[length:var(--fs-base)] text-[#626F47] tracking-wider">
                  {user?.messCode ?? "—"}
                </span>
                {user?.messCode && (
                  <button
                    onClick={copyCode}
                    className="w-7 h-7 bg-[rgba(98,111,71,0.1)] rounded-[6px] flex items-center justify-center text-[#626F47]"
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Meal participation toggle */}
        {myMember && (
          <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-5 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-[10px] bg-[rgba(98,111,71,0.12)] flex items-center justify-center shrink-0">
                  <UtensilsCrossed size={18} className="text-[#626F47]" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[length:var(--fs-base)] text-[#2C2F1E]">
                    {t("manager.settings.mealParticipation")}
                  </div>
                  <div className="text-[length:var(--fs-sm)] text-[#6B7550]">
                    {t("manager.settings.mealParticipationDesc")}
                  </div>
                </div>
              </div>
              <button
                onClick={handleToggle}
                disabled={isToggling}
                aria-pressed={participates}
                className={[
                  "relative shrink-0 w-[48px] h-[27px] rounded-full transition-colors duration-200",
                  participates ? "bg-[#626F47]" : "bg-[#C5BFAF]",
                  isToggling ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-[3px] left-[3px] w-[21px] h-[21px] bg-white rounded-full shadow-sm transition-transform duration-200",
                    participates ? "translate-x-[21px]" : "translate-x-0",
                  ].join(" ")}
                />
              </button>
            </div>
            <p className={[
              "mt-3 text-[length:var(--fs-sm)] font-medium text-center",
              participates ? "text-[#626F47]" : "text-[#A09070]",
            ].join(" ")}>
              {participates
                ? t("manager.settings.mealParticipationOn")
                : t("manager.settings.mealParticipationOff")}
            </p>
          </div>
        )}

        {/* Join Approval Toggle */}
        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-5 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-[10px] bg-[rgba(98,111,71,0.12)] flex items-center justify-center shrink-0">
                <UserCheck size={18} className="text-[#626F47]" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[length:var(--fs-base)] text-[#2C2F1E]">
                  {t("manager.settings.joinApproval")}
                </div>
                <div className="text-[length:var(--fs-sm)] text-[#6B7550]">
                  {t("manager.settings.joinApprovalDesc")}
                </div>
              </div>
            </div>
            <button
              onClick={handleToggleApproval}
              disabled={isTogglingApproval}
              aria-pressed={requiresApproval}
              className={[
                "relative shrink-0 w-[48px] h-[27px] rounded-full transition-colors duration-200",
                requiresApproval ? "bg-[#626F47]" : "bg-[#C5BFAF]",
                isTogglingApproval ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-[3px] left-[3px] w-[21px] h-[21px] bg-white rounded-full shadow-sm transition-transform duration-200",
                  requiresApproval ? "translate-x-[21px]" : "translate-x-0",
                ].join(" ")}
              />
            </button>
          </div>
          <p className={["mt-3 text-[length:var(--fs-sm)] font-medium text-center", requiresApproval ? "text-[#626F47]" : "text-[#A09070]"].join(" ")}>
            {requiresApproval ? t("manager.settings.joinApprovalOn") : t("manager.settings.joinApprovalOff")}
          </p>
        </div>

        {/* Settings links */}
        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] overflow-hidden mb-4">
          <Link
            to="/manager/settings/feedback"
            className="flex items-center gap-3 px-4 py-4 border-b border-[#EAE0CC]"
          >
            <MessageSquare size={18} className="text-[#626F47] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[length:var(--fs-base)] text-[#2C2F1E]">
                {t("manager.settings.feedbackManagement")}
              </div>
              <div className="text-[length:var(--fs-sm)] text-[#6B7550]">
                {t("manager.settings.feedbackManagementDesc")}
              </div>
            </div>
            <ChevronRight size={16} className="text-[#A09070]" />
          </Link>
          <Link
            to="/manager/settings/lifecycle"
            className="flex items-center gap-3 px-4 py-4"
          >
            <AlertTriangle size={18} className="text-red-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[length:var(--fs-base)] text-[#2C2F1E]">
                {t("manager.settings.lifecycle")}
              </div>
              <div className="text-[length:var(--fs-sm)] text-[#6B7550]">
                {t("manager.settings.lifecycleDesc")}
              </div>
            </div>
            <ChevronRight size={16} className="text-[#A09070]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
