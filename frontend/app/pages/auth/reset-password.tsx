import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { resetPassword } from "~/services/httpServices/authService";
import { getErrorMessage } from "~/utils/errorHandler";

type FormData = { password: string; confirm: string };

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = z
    .object({
      password: z.string().min(8, t("validation.passwordMin8")),
      confirm: z.string(),
    })
    .refine((d) => d.password === d.confirm, {
      message: t("validation.passwordNoMatch"),
      path: ["confirm"],
    });

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
      await resetPassword({ token, password: data.password });
      navigate("/login");
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  return (
    <div className="min-h-screen bg-[#F5ECD5]">
      <div className="max-w-[520px] mx-auto px-4 pt-12">
        <div className="w-14 h-14 bg-[#F0BB78] rounded-[16px] flex items-center justify-center mb-5">
          <KeyRound size={28} className="text-[#2C2F1E]" />
        </div>
        <h1 className="font-display font-bold text-[length:var(--fs-4xl)] text-[#2C2F1E] mb-2">
          {t("auth.reset.title")}
        </h1>
        <p className="text-[length:var(--fs-base)] text-[#6B7550] mb-8">
          {t("auth.reset.subtitle")}
        </p>

        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-5">
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[length:var(--fs-md)] text-red-700">
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-4">
              <label className="flex items-center gap-1.5 text-[length:var(--fs-xs)] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-2">
                <Lock size={12} /> {t("auth.reset.newPassword")}
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder={t("auth.reset.passwordPlaceholder")}
                  className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[11px] pr-11 text-[length:var(--fs-base)] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47] placeholder:text-[#C0B090]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A09070]"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[length:var(--fs-sm)] text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="mb-5">
              <label className="flex items-center gap-1.5 text-[length:var(--fs-xs)] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-2">
                <Lock size={12} /> {t("auth.reset.confirmPassword")}
              </label>
              <input
                {...register("confirm")}
                type={showPass ? "text" : "password"}
                placeholder={t("auth.reset.repeatPlaceholder")}
                className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[11px] text-[length:var(--fs-base)] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47] placeholder:text-[#C0B090]"
              />
              {errors.confirm && (
                <p className="mt-1 text-[length:var(--fs-sm)] text-red-600">
                  {errors.confirm.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#626F47] text-[#F5ECD5] font-bold text-[length:var(--fs-lg)] py-[13px] rounded-[12px] disabled:opacity-60"
            >
              {isSubmitting ? t("auth.reset.resetting") : t("auth.reset.resetPassword")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
