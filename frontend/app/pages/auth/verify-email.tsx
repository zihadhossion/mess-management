import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { verifyEmail } from "~/services/httpServices/authService";
import { getErrorMessage } from "~/utils/errorHandler";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg(t("auth.verify.invalidToken"));
      return;
    }
    verifyEmail({ token })
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setErrorMsg(getErrorMessage(err));
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#F5ECD5] flex items-center justify-center px-4">
      <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-8 text-center max-w-sm w-full">
        {status === "loading" && (
          <>
            <Loader2 size={48} className="text-[#626F47] animate-spin mx-auto mb-4" />
            <p className="text-[length:var(--fs-base)] text-[#6B7550]">{t("auth.verify.verifying")}</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle size={48} className="text-[#626F47] mx-auto mb-4" />
            <h2 className="font-display font-bold text-[length:var(--fs-2xl)] text-[#2C2F1E] mb-2">
              {t("auth.verify.verified")}
            </h2>
            <p className="text-[length:var(--fs-md)] text-[#6B7550] mb-6">
              {t("auth.verify.verifiedDesc")}
            </p>
            <Link
              to="/login"
              className="block w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[length:var(--fs-lg)] py-[13px] rounded-[12px] text-center"
            >
              {t("auth.verify.signIn")}
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="font-display font-bold text-[length:var(--fs-2xl)] text-[#2C2F1E] mb-2">
              {t("auth.verify.failed")}
            </h2>
            <p className="text-[length:var(--fs-md)] text-red-600 mb-6">{errorMsg}</p>
            <Link
              to="/login"
              className="block w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[length:var(--fs-lg)] py-[13px] rounded-[12px] text-center"
            >
              {t("auth.verify.backToLogin")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
