import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { UtensilsCrossed, Users, ChevronRight } from "lucide-react";
import { useAuth } from "~/hooks/useAuth";
import { Role } from "~/enums/role.enum";

export default function RoleSelectionPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#F5ECD5]">
      <div className="bg-[#626F47] px-5 pt-6 pb-7 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#F0BB78] rounded-[12px] flex items-center justify-center">
              <UtensilsCrossed size={20} className="text-[#2C2F1E]" />
            </div>
            <div className="font-display font-bold text-[18px] text-[#F5ECD5]">
              {t("common.appName")}
            </div>
          </div>
          <h2 className="font-display font-bold text-[20px] text-[#F5ECD5] mb-1">
            {t("roleSelection.welcome", { name: user?.name ?? "there" })}
          </h2>
          <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
            {t("roleSelection.instruction")}
          </p>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-3">
        {(user?.role === Role.MEMBER || !user?.role) && (
          <Link
            to="/member/dashboard"
            className="flex items-center gap-4 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.08)] hover:border-[#626F47] transition-colors"
          >
            <div className="w-12 h-12 bg-[rgba(98,111,71,0.12)] rounded-[12px] flex items-center justify-center">
              <Users size={24} className="text-[#626F47]" />
            </div>
            <div className="flex-1">
              <div className="font-display font-bold text-[16px] text-[#2C2F1E]">
                {t("roleSelection.memberRole")}
              </div>
              <div className="text-[13px] text-[#6B7550]">
                {t("roleSelection.memberDesc")}
              </div>
            </div>
            <ChevronRight size={20} className="text-[#A09070]" />
          </Link>
        )}

        {(user?.role === Role.MANAGER || !user?.role) && (
          <Link
            to="/manager/dashboard"
            className="flex items-center gap-4 bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.08)] hover:border-[#626F47] transition-colors"
          >
            <div className="w-12 h-12 bg-[rgba(240,187,120,0.2)] rounded-[12px] flex items-center justify-center">
              <UtensilsCrossed size={24} className="text-[#626F47]" />
            </div>
            <div className="flex-1">
              <div className="font-display font-bold text-[16px] text-[#2C2F1E]">
                {t("roleSelection.managerRole")}
              </div>
              <div className="text-[13px] text-[#6B7550]">
                {t("roleSelection.managerDesc")}
              </div>
            </div>
            <ChevronRight size={20} className="text-[#A09070]" />
          </Link>
        )}

        {!user?.messId && (
          <div className="mt-6 pt-6 border-t border-[#D9CEB4]">
            <p className="text-[12px] text-[#6B7550] mb-3">
              {t("roleSelection.notPartOf")}
            </p>
            <div className="flex gap-3">
              <Link
                to="/join-mess"
                className="flex-1 text-center py-3 border border-[#626F47] text-[#626F47] font-semibold text-[13px] rounded-[10px] hover:bg-[rgba(98,111,71,0.06)]"
              >
                {t("roleSelection.joinMess")}
              </Link>
              <Link
                to="/mess-creation"
                className="flex-1 text-center py-3 bg-[#626F47] text-[#F5ECD5] font-semibold text-[13px] rounded-[10px]"
              >
                {t("roleSelection.createMess")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
