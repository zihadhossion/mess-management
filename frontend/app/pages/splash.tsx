import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { UtensilsCrossed } from "lucide-react";
import { useAuth } from "~/hooks/useAuth";
import { Role } from "~/enums/role.enum";

export default function SplashPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        if (!user.isEmailVerified) {
          navigate("/resend-verification");
        } else if (user.onboardingStatus === "pending") {
          navigate("/onboarding/mess-creation-pending");
        } else if (user.onboardingStatus === "rejected") {
          navigate("/onboarding/mess-creation-rejected");
        } else if (!user.messId) {
          navigate("/onboarding/role-selection");
        } else if (user.role === Role.MANAGER) {
          navigate("/manager/dashboard");
        } else {
          navigate("/member/dashboard");
        }
      } else {
        navigate("/login");
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#626F47] relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-[rgba(240,187,120,0.15)] rounded-full" />
      <div className="absolute -bottom-24 -left-20 w-[280px] h-[280px] bg-[rgba(164,180,101,0.12)] rounded-full" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-[#F0BB78] rounded-[22px] flex items-center justify-center shadow-[0_8px_32px_rgba(240,187,120,0.5)] mb-5">
          <UtensilsCrossed size={44} className="text-[#2C2F1E]" />
        </div>
        <h1 className="font-display font-bold text-[length:var(--fs-6xl)] text-[#F5ECD5] tracking-[-0.5px] mb-1.5">
          {t("common.appName")}
        </h1>
        <p className="text-[length:var(--fs-base)] text-[rgba(245,236,213,0.72)] text-center mb-[60px]">
          {t("splash.tagline")}
        </p>

        <div className="w-[200px]">
          <div className="h-1 bg-[rgba(245,236,213,0.2)] rounded-[2px] overflow-hidden">
            <div className="h-full bg-[#F0BB78] rounded-[2px] animate-progress" />
          </div>
          <p className="text-[length:var(--fs-xs)] text-[rgba(245,236,213,0.55)] text-center mt-2.5">
            {t("splash.loading")}
          </p>
        </div>
      </div>

      <p className="absolute bottom-10 left-0 right-0 text-center text-[length:var(--fs-sm)] text-[rgba(245,236,213,0.45)]">
        {t("splash.platform")}
      </p>
    </div>
  );
}
