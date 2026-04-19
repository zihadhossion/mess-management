import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { forgotPassword } from "~/services/httpServices/authService";
import { getErrorMessage } from "~/utils/errorHandler";

type FormData = { email: string };

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = z.object({ email: z.string().email(t("validation.invalidEmail")) });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await forgotPassword(data);
      setSent(true);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  return (
    <div className="min-h-screen bg-[#F5ECD5]">
      <div className="max-w-[520px] mx-auto px-4 pt-12">
        <Link
          to="/login"
          className="flex items-center gap-2 text-[#626F47] font-semibold text-[length:var(--fs-base)] mb-8"
        >
          <ArrowLeft size={18} /> {t("auth.forgot.backToLogin")}
        </Link>

        <div className="w-14 h-14 bg-[#F0BB78] rounded-[16px] flex items-center justify-center mb-5">
          <Mail size={28} className="text-[#2C2F1E]" />
        </div>
        <h1 className="font-display font-bold text-[length:var(--fs-4xl)] text-[#2C2F1E] mb-2">
          {t("auth.forgot.title")}
        </h1>
        <p className="text-[length:var(--fs-base)] text-[#6B7550] mb-8">
          {t("auth.forgot.subtitle")}
        </p>

        {sent ? (
          <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-5 text-center">
            <div className="w-12 h-12 bg-[#626F47] rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={22} className="text-[#F5ECD5]" />
            </div>
            <h3 className="font-display font-bold text-[length:var(--fs-xl)] text-[#2C2F1E] mb-2">
              {t("auth.forgot.checkEmail")}
            </h3>
            <p className="text-[length:var(--fs-md)] text-[#6B7550]">
              {t("auth.forgot.successMessage")}
            </p>
          </div>
        ) : (
          <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-5 shadow-[0_4px_16px_rgba(74,60,30,0.1)]">
            {serverError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[length:var(--fs-md)] text-red-700">
                {serverError}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-5">
                <label className="flex items-center gap-1.5 text-[length:var(--fs-xs)] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-2">
                  <Mail size={12} /> {t("auth.forgot.emailLabel")}
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder={t("auth.forgot.emailPlaceholder")}
                  className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[11px] text-[length:var(--fs-base)] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47] placeholder:text-[#C0B090]"
                />
                {errors.email && (
                  <p className="mt-1 text-[length:var(--fs-sm)] text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-[#626F47] text-[#F5ECD5] font-bold text-[length:var(--fs-lg)] py-[13px] rounded-[12px] disabled:opacity-60"
              >
                <Send size={18} />
                {isSubmitting ? t("auth.forgot.sending") : t("auth.forgot.sendLink")}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
