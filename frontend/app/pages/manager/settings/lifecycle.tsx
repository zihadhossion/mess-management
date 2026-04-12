import { useState } from "react";
import { ArrowLeft, AlertTriangle, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { post } from "~/services/httpMethods/post";
import { getErrorMessage } from "~/utils/errorHandler";
import { useAppSelector } from "~/redux/store/hooks";

export default function MessLifecyclePage() {
  const { t } = useTranslation();
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleRequestDeletion() {
    if (!messId || !reason.trim()) return;
    if (!confirm(t("manager.settings.confirmDeletion"))) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await post(`/messes/${messId}/deletion-request`, { reason });
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-full flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} className="text-red-500" />
          </div>
          <h2 className="font-display font-bold text-[20px] text-[#2C2F1E] mb-2">
            {t("manager.settings.deletionRequested")}
          </h2>
          <p className="text-[13px] text-[#6B7550] mb-6">
            {t("manager.settings.deletionRequestedDesc")}
          </p>
          <Link
            to="/manager/dashboard"
            className="block w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[15px] py-[13px] rounded-[12px] text-center"
          >
            {t("manager.settings.backToDashboard")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6">
        <Link
          to="/manager/settings"
          className="flex items-center gap-2 text-[rgba(245,236,213,0.8)] text-[13px] mb-1"
        >
          <ArrowLeft size={16} /> {t("manager.settings.lifecycleBack")}
        </Link>
        <h1 className="font-display font-bold text-[20px] text-[#F5ECD5]">
          {t("manager.settings.lifecycleTitle")}
        </h1>
      </div>

      <div className="px-4 pt-6 max-w-[640px] mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-[16px] p-5 mb-5">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[15px] text-red-700 mb-1">
                {t("manager.settings.requestDeletionTitle")}
              </div>
              <p className="text-[13px] text-red-600">
                {t("manager.settings.requestDeletionDesc")}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[11px] font-semibold text-red-700 uppercase tracking-[0.06em] mb-2 block">
              {t("manager.settings.reasonLabel")}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder={t("manager.settings.reasonPlaceholder")}
              className="w-full border border-red-200 rounded-[10px] px-4 py-3 text-[14px] text-[#2C2F1E] bg-white outline-none focus:border-red-400 resize-none placeholder:text-red-300"
            />
          </div>

          {error && (
            <div className="mb-3 p-3 bg-white border border-red-200 rounded-[10px] text-[13px] text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleRequestDeletion}
            disabled={isSubmitting || !reason.trim()}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold text-[14px] py-[12px] rounded-[10px] disabled:opacity-50"
          >
            <Trash2 size={18} />
            {isSubmitting ? t("manager.settings.submitting") : t("manager.settings.requestDeletion")}
          </button>
        </div>
      </div>
    </div>
  );
}
