import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  UtensilsCrossed,
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useAppDispatch } from "~/redux/store/hooks";
import { loginSuccess } from "~/redux/features/authSlice";
import { loginUser } from "~/services/httpServices/authService";
import { getErrorMessage } from "~/utils/errorHandler";
import { Role } from "~/enums/role.enum";
import { LanguageSwitcher } from "~/components/atoms/LanguageSwitcher";

type FormData = { email: string; password: string };

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = z.object({
    email: z.string().email(t("validation.invalidEmail")),
    password: z.string().min(6, t("validation.passwordMin6")),
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
      const user = await loginUser(data);
      dispatch(loginSuccess(user));
      if (!user.isEmailVerified) {
        navigate("/resend-verification");
      } else if (user.role === Role.MANAGER && !user.messId) {
        navigate("/role-selection");
      } else if (user.role === Role.ADMIN) {
        navigate("/admin/dashboard");
      } else if (user.role === Role.MANAGER) {
        navigate("/manager/dashboard");
      } else {
        navigate("/member/dashboard");
      }
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  return (
    <div className="min-h-screen bg-[#F5ECD5]">
      {/* Hero */}
      <div className="bg-[#626F47] px-5 pt-6 pb-7 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="absolute -bottom-10 -left-5 w-[100px] h-[100px] bg-[rgba(164,180,101,0.12)] rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F0BB78] rounded-[12px] flex items-center justify-center">
                <UtensilsCrossed size={20} className="text-[#2C2F1E]" />
              </div>
              <div>
                <div className="font-display font-bold text-[18px] text-[#F5ECD5]">
                  {t("common.appName")}
                </div>
                <div className="text-[11px] text-[rgba(245,236,213,0.7)]">
                  {t("auth.login.subtitle")}
                </div>
              </div>
            </div>
            <LanguageSwitcher variant="light" />
          </div>
          <h2 className="font-display font-bold text-[20px] text-[#F5ECD5] mb-1">
            {t("auth.login.title")}
          </h2>
          <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
            {t("auth.login.description")}
          </p>
        </div>
      </div>

      {/* Amber band */}
      <div className="bg-[#F0BB78] px-5 py-2 flex items-center gap-2">
        <ShieldCheck size={14} className="text-[#2C2F1E]" />
        <span className="text-[12px] font-semibold text-[#2C2F1E]">
          {t("auth.login.securityBadge")}
        </span>
      </div>

      {/* Form */}
      <div className="px-4 pt-5 max-w-[520px] mx-auto">
        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-5 shadow-[0_4px_16px_rgba(74,60,30,0.1)]">
          {serverError && (
            <div
              role="alert"
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700"
            >
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-4">
              <label
                htmlFor="login-email"
                className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-2"
              >
                <Mail size={12} /> {t("auth.login.emailLabel")}
              </label>
              <input
                {...register("email")}
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder={t("auth.login.emailPlaceholder")}
                className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[11px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47] focus:ring-2 focus:ring-[rgba(98,111,71,0.15)] placeholder:text-[#C0B090]"
              />
              {errors.email && (
                <p className="mt-1 text-[12px] text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="mb-5">
              <label
                htmlFor="login-password"
                className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-2"
              >
                <Lock size={12} /> {t("auth.login.passwordLabel")}
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={t("auth.login.passwordPlaceholder")}
                  className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[11px] pr-11 text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47] focus:ring-2 focus:ring-[rgba(98,111,71,0.15)] placeholder:text-[#C0B090]"
                />
                <button
                  type="button"
                  aria-label={showPassword ? t("auth.login.hidePassword") : t("auth.login.showPassword")}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A09070]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[12px] text-red-600">
                  {errors.password.message}
                </p>
              )}
              <Link
                to="/forgot-password"
                className="block mt-2 text-[12px] text-[#626F47] font-semibold text-right"
              >
                {t("auth.login.forgotPassword")}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#626F47] text-[#F5ECD5] font-bold text-[15px] py-[13px] rounded-[12px] hover:bg-[#4d5638] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogIn size={18} />
              {isSubmitting ? t("auth.login.signingIn") : t("auth.login.signIn")}
            </button>

            <div className="my-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#E0D5BC]" />
              <span className="text-[12px] text-[#A09070]">{t("common.or")}</span>
              <div className="flex-1 h-px bg-[#E0D5BC]" />
            </div>

            <p className="text-center text-[13px] text-[#6B7550]">
              {t("auth.login.newToApp")}{" "}
              <Link to="/signup" className="text-[#626F47] font-bold">
                {t("auth.login.createAccount")}
              </Link>
            </p>

            <div className="mt-4 flex items-start gap-2 p-3 bg-[rgba(98,111,71,0.07)] rounded-[10px]">
              <Info size={14} className="text-[#626F47] mt-0.5 shrink-0" />
              <p className="text-[11px] text-[#6B7550]">
                {t("auth.login.joinInfo")}{" "}
                <strong>{t("auth.login.messId")}</strong>{" "}
                {t("auth.login.joinInfoSuffix")}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
