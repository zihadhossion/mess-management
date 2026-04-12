import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Mail, RefreshCw } from "lucide-react";
import { resendVerification } from "~/services/httpServices/authService";
import { getErrorMessage } from "~/utils/errorHandler";

type FormData = { email: string };

export default function ResendVerificationPage() {
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
      await resendVerification(data.email);
      setSent(true);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  return (
    <div className="min-h-screen bg-[#F5ECD5]">
      <div className="max-w-[520px] mx-auto px-4 pt-12">
        <div className="w-14 h-14 bg-[#F0BB78] rounded-[16px] flex items-center justify-center mb-5">
          <Mail size={28} className="text-[#2C2F1E]" />
        </div>
        <h1 className="font-display font-bold text-[26px] text-[#2C2F1E] mb-2">
          {t("auth.resend.title")}
        </h1>
        <p className="text-[14px] text-[#6B7550] mb-8">
          {t("auth.resend.subtitle")}
        </p>

        {sent ? (
          <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-5 text-center">
            <p className="text-[14px] text-[#626F47] font-semibold mb-2">
              {t("auth.resend.successMessage")}
            </p>
            <p className="text-[13px] text-[#6B7550] mb-4">
              {t("auth.resend.successDesc")}
            </p>
            <Link to="/login" className="text-[#626F47] font-bold text-[13px]">
              {t("auth.resend.backToLogin")}
            </Link>
          </div>
        ) : (
          <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-5">
            {serverError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700">
                {serverError}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-5">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-2">
                  <Mail size={12} /> {t("auth.resend.emailLabel")}
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder={t("auth.resend.emailPlaceholder")}
                  className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[11px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47] placeholder:text-[#C0B090]"
                />
                {errors.email && (
                  <p className="mt-1 text-[12px] text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-[#626F47] text-[#F5ECD5] font-bold text-[15px] py-[13px] rounded-[12px] disabled:opacity-60"
              >
                <RefreshCw size={18} />
                {isSubmitting ? t("auth.resend.sending") : t("auth.resend.resend")}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
