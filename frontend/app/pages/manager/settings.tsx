import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Copy, ChevronRight } from "lucide-react";
import { useAuth } from "~/hooks/useAuth";
import { LanguageSwitcher } from "~/components/atoms/LanguageSwitcher";

export default function ManagerSettingsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

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
            <h1 className="font-display font-bold text-[20px] text-[#F5ECD5]">
              {t("manager.settings.title")}
            </h1>
            <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
              {t("manager.settings.subtitle")}
            </p>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Mess info */}
        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-5 mb-4">
          <h3 className="font-display font-bold text-[15px] text-[#2C2F1E] mb-3">
            {t("manager.settings.messInfo")}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[13px] text-[#6B7550]">{t("manager.settings.messName")}</span>
              <span className="text-[13px] font-semibold text-[#2C2F1E]">
                {user?.messName ?? "—"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-[#6B7550]">{t("manager.settings.messCode")}</span>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-[14px] text-[#626F47] tracking-wider">
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

        {/* Settings links */}
        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] overflow-hidden mb-4">
          <Link
            to="/manager/settings/lifecycle"
            className="flex items-center gap-3 px-4 py-4 border-b border-[#EAE0CC]"
          >
            <AlertTriangle size={18} className="text-red-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[14px] text-[#2C2F1E]">
                {t("manager.settings.lifecycle")}
              </div>
              <div className="text-[12px] text-[#6B7550]">
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
