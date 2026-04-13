import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  UtensilsCrossed,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import { signupUser } from "~/services/httpServices/authService";
import { getErrorMessage } from "~/utils/errorHandler";

type FormData = { fullName: string; email: string; password: string; role: "MEMBER" | "MANAGER" };

export default function SignupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = z.object({
    fullName: z.string().min(2, t("validation.nameMin2")),
    email: z.string().email(t("validation.invalidEmail")),
    password: z.string().min(8, t("validation.passwordMin8")),
    role: z.enum(["MEMBER", "MANAGER"]),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "MEMBER" },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await signupUser(data);
      toast.success(t("auth.signup.successMessage"));
      navigate("/login");
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

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
            {t("auth.signup.title")}
          </h2>
          <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
            {t("auth.signup.subtitle")}
          </p>
        </div>
      </div>

      <div className="px-4 py-4 sm:py-5 max-w-[520px] mx-auto">
        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-5 shadow-[0_4px_16px_rgba(74,60,30,0.1)]">
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700">
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-4">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-2">
                <User size={12} /> {t("auth.signup.nameLabel")}
              </label>
              <input
                {...register("fullName")}
                type="text"
                placeholder={t("auth.signup.namePlaceholder")}
                className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[11px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47] focus:ring-2 focus:ring-[rgba(98,111,71,0.15)] placeholder:text-[#C0B090]"
              />
              {errors.fullName && (
                <p className="mt-1 text-[12px] text-red-600">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-2">
                <Mail size={12} /> {t("auth.signup.emailLabel")}
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder={t("auth.signup.emailPlaceholder")}
                className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[11px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47] focus:ring-2 focus:ring-[rgba(98,111,71,0.15)] placeholder:text-[#C0B090]"
              />
              {errors.email && (
                <p className="mt-1 text-[12px] text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="mb-5">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-2">
                <Lock size={12} /> {t("auth.signup.passwordLabel")}
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.signup.passwordPlaceholder")}
                  className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[11px] pr-11 text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47] focus:ring-2 focus:ring-[rgba(98,111,71,0.15)] placeholder:text-[#C0B090]"
                />
                <button
                  type="button"
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
            </div>

            <div className="mb-5">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-2">
                <User size={12} /> {t("auth.signup.roleLabel")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue("role", "MEMBER")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-[10px] border-2 transition-colors text-left ${selectedRole === "MEMBER"
                    ? "border-[#626F47] bg-[rgba(98,111,71,0.08)]"
                    : "border-[#D9CEB4] bg-[#FDFAF3]"
                    }`}
                >
                  <User size={20} className={selectedRole === "MEMBER" ? "text-[#626F47]" : "text-[#A09070]"} />
                  <span className={`text-[13px] font-semibold ${selectedRole === "MEMBER" ? "text-[#626F47]" : "text-[#2C2F1E]"}`}>
                    {t("auth.signup.roleMember")}
                  </span>
                  <span className="text-[11px] text-[#A09070] text-center leading-tight">
                    {t("auth.signup.roleMemberDesc")}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setValue("role", "MANAGER")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-[10px] border-2 transition-colors text-left ${selectedRole === "MANAGER"
                    ? "border-[#626F47] bg-[rgba(98,111,71,0.08)]"
                    : "border-[#D9CEB4] bg-[#FDFAF3]"
                    }`}
                >
                  <Shield size={20} className={selectedRole === "MANAGER" ? "text-[#626F47]" : "text-[#A09070]"} />
                  <span className={`text-[13px] font-semibold ${selectedRole === "MANAGER" ? "text-[#626F47]" : "text-[#2C2F1E]"}`}>
                    {t("auth.signup.roleManager")}
                  </span>
                  <span className="text-[11px] text-[#A09070] text-center leading-tight">
                    {t("auth.signup.roleManagerDesc")}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#626F47] text-[#F5ECD5] font-bold text-[15px] py-[13px] rounded-[12px] hover:bg-[#4d5638] transition-colors disabled:opacity-60"
            >
              <UserPlus size={18} />
              {isSubmitting ? t("auth.signup.creatingAccount") : t("auth.signup.createAccount")}
            </button>

            <p className="text-center mt-4 text-[13px] text-[#6B7550]">
              {t("auth.signup.alreadyHave")}{" "}
              <Link to="/login" className="text-[#626F47] font-bold">
                {t("auth.signup.signIn")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
