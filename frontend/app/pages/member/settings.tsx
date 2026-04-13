import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { User, LogOut, ChevronRight, Bell } from "lucide-react";
import { useAuth } from "~/hooks/useAuth";
import { logoutUser } from "~/services/httpServices/authService";
import { patch } from "~/services/httpMethods/patch";
import { getErrorMessage } from "~/utils/errorHandler";
import { Link } from "react-router";
import { LanguageSwitcher } from "~/components/atoms/LanguageSwitcher";

type ProfileData = { fullName: string };

export default function MemberSettingsPage() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const profileSchema = z.object({
    fullName: z.string().min(2, t("validation.nameMin2")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.name ?? "" },
  });

  async function onSubmit(data: ProfileData) {
    setServerError(null);
    try {
      await patch(`/users/me`, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
    } catch {
      /* ignore */
    }
    signOut();
  }

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="font-display font-bold text-[20px] text-[#F5ECD5]">
              {t("member.settings.title")}
            </h1>
            <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
              {t("member.settings.subtitle")}
            </p>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Profile card */}
      <div className="px-4 pt-4 max-w-[640px] mx-auto">
        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-5 mb-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-full bg-[#F0BB78] flex items-center justify-center font-display font-bold text-[22px] text-[#2C2F1E]">
              {user?.name?.[0]?.toUpperCase() ?? "M"}
            </div>
            <div>
              <div className="font-display font-bold text-[16px] text-[#2C2F1E]">
                {user?.name}
              </div>
              <div className="text-[13px] text-[#6B7550]">{user?.email}</div>
              {user?.messName && (
                <div className="text-[12px] text-[#A09070]">{user.messName}</div>
              )}
            </div>
          </div>

          {serverError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700">
              {serverError}
            </div>
          )}
          {saved && (
            <div className="mb-3 p-3 bg-[rgba(98,111,71,0.1)] border border-[#626F47] rounded-[10px] text-[13px] text-[#626F47]">
              {t("member.settings.profileUpdated")}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-4">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-2">
                <User size={12} /> {t("member.settings.displayName")}
              </label>
              <input
                {...register("fullName")}
                type="text"
                className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[10px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47]"
              />
              {errors.fullName && (
                <p className="mt-1 text-[12px] text-red-600">
                  {errors.fullName.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[14px] py-[11px] rounded-[10px] disabled:opacity-60"
            >
              {isSubmitting ? t("member.settings.saving") : t("member.settings.saveChanges")}
            </button>
          </form>
        </div>

        {/* Quick links */}
        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] overflow-hidden mb-4">
          {[
            { to: "/member/notifications", icon: Bell, label: t("member.settings.notifications") },
          ].map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-4 py-3.5 border-b border-[#EAE0CC] last:border-b-0"
            >
              <Icon size={18} className="text-[#626F47]" />
              <span className="flex-1 text-[14px] font-semibold text-[#2C2F1E]">
                {label}
              </span>
              <ChevronRight size={16} className="text-[#A09070]" />
            </Link>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border border-red-300 text-red-600 font-bold text-[14px] py-3.5 rounded-[14px] hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          {t("member.settings.signOut")}
        </button>
      </div>
    </div>
  );
}
