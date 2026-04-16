import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UtensilsCrossed, Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { useAppDispatch } from "~/redux/store/hooks";
import { loginSuccess } from "~/redux/features/authSlice";
import { loginUser } from "~/services/httpServices/authService";
import { getErrorMessage } from "~/utils/errorHandler";
import { useNavigate } from "react-router";
import { Role } from "~/enums/role.enum";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password required"),
});
type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
      if (user.role !== Role.ADMIN) {
        setServerError(
          "Access denied. This portal is for administrators only.",
        );
        return;
      }
      dispatch(loginSuccess(user));
      navigate("/dashboard");
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#F0EBE0" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#F0BB78] rounded-[16px] flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed size={28} className="text-[#2C2F1E]" />
          </div>
          <h1 className="font-display font-bold text-[26px] text-[#2C2F1E]">
            MessHub Admin
          </h1>
          <p className="text-[15px] text-[#6B7550] mt-1">
            Sign in to manage the platform
          </p>
        </div>

        <div className="bg-white border border-[#D9CEB4] rounded-[20px] p-6 shadow-[0_4px_24px_rgba(74,60,30,0.1)]">
          {serverError && (
            <div
              role="alert"
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[15px] text-red-700"
            >
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-4">
              <label
                htmlFor="admin-email"
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-2"
              >
                <Mail size={12} /> Email
              </label>
              <input
                {...register("email")}
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@messhub.app"
                className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[11px] text-base text-[#2C2F1E] outline-none focus:border-[#626F47] focus:ring-2 focus:ring-[rgba(98,111,71,0.15)] placeholder:text-[#C0B090]"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="mb-6">
              <label
                htmlFor="admin-password"
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-2"
              >
                <Lock size={12} /> Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[11px] pr-11 text-base text-[#2C2F1E] outline-none focus:border-[#626F47] focus:ring-2 focus:ring-[rgba(98,111,71,0.15)] placeholder:text-[#C0B090]"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A09070]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#626F47] text-[#F5ECD5] font-bold text-[17px] py-[13px] rounded-[12px] hover:bg-[#4d5638] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogIn size={18} />
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
