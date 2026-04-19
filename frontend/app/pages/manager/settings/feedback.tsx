import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MessageSquare, X } from "lucide-react";
import { get } from "~/services/httpMethods/get";
import { post } from "~/services/httpMethods/post";
import { getErrorMessage } from "~/utils/errorHandler";
import { useAppSelector } from "~/redux/store/hooks";
import type { Feedback } from "~/types/member.d";
import { format } from "date-fns";
import toast from "react-hot-toast";

type Filter = "all" | "open" | "resolved";

export default function FeedbackManagementPage() {
  const { t } = useTranslation();
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [resolveTarget, setResolveTarget] = useState<Feedback | null>(null);
  const [resolveNotes, setResolveNotes] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  function load() {
    if (!messId) return;
    setIsLoading(true);
    get<{ data: Feedback[] }>(`/messes/${messId}/feedback`)
      .then((res) => setFeedback(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, [messId]);

  async function handleResolve() {
    if (!resolveTarget || !messId) return;
    setResolveError(null);
    setResolving(true);
    try {
      await post(`/messes/${messId}/feedback/${resolveTarget.id}/resolve`, {
        resolutionNotes: resolveNotes || undefined,
      });
      toast.success(t("manager.settings.resolveSuccess"));
      setResolveTarget(null);
      setResolveNotes("");
      load();
    } catch (err) {
      setResolveError(getErrorMessage(err));
    } finally {
      setResolving(false);
    }
  }

  const filtered = feedback.filter((f) => {
    if (filter === "open") return f.status === "open" || f.status === "pending";
    if (filter === "resolved") return f.status === "resolved";
    return true;
  });

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-4 relative overflow-hidden">
        <div className="relative z-10">
          <Link
            to="/manager/settings"
            className="flex items-center gap-2 text-[rgba(245,236,213,0.8)] text-[length:var(--fs-md)] mb-1"
          >
            <ArrowLeft size={16} /> {t("manager.settings.feedbackBack")}
          </Link>
          <h1 className="font-display font-bold text-[length:var(--fs-2xl)] text-[#F5ECD5]">
            {t("manager.settings.feedbackTitle")}
          </h1>
        </div>

        {/* Filter tabs */}
        <div className="relative z-10 flex gap-1 mt-3 bg-[rgba(0,0,0,0.15)] rounded-[10px] p-1">
          {(["all", "open", "resolved"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 text-[length:var(--fs-sm)] font-semibold rounded-[8px] transition-colors ${
                filter === f ? "bg-[#F5ECD5] text-[#2C2F1E]" : "text-[rgba(245,236,213,0.7)]"
              }`}
            >
              {t(`manager.settings.filter${f.charAt(0).toUpperCase() + f.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={28} className="text-[#A09070] mx-auto mb-3" />
            <p className="text-[length:var(--fs-base)] text-[#6B7550] font-semibold">
              {t("manager.settings.noFeedback")}
            </p>
          </div>
        ) : (
          filtered.map((fb) => {
            const isResolved = fb.status === "resolved";
            return (
              <div
                key={fb.id}
                className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4 mb-3"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[length:var(--fs-base)] text-[#2C2F1E]">
                      {fb.userName}
                    </div>
                    <div className="text-[length:var(--fs-xs)] text-[#6B7550]">
                      {fb.date
                        ? format(new Date(fb.date), "MMM d, yyyy")
                        : format(new Date(fb.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                  <span
                    className={`text-[length:var(--fs-2xs)] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      isResolved
                        ? "bg-[rgba(98,111,71,0.12)] text-[#626F47]"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {isResolved ? t("manager.settings.resolved") : t("manager.settings.open")}
                  </span>
                </div>

                <p className="text-[length:var(--fs-md)] text-[#2C2F1E] mb-2">
                  {fb.complaint ?? fb.message}
                </p>

                {fb.resolutionNotes && (
                  <div className="bg-[rgba(98,111,71,0.06)] rounded-[8px] px-3 py-2 mb-2">
                    <p className="text-[length:var(--fs-xs)] text-[#6B7550] italic">{fb.resolutionNotes}</p>
                  </div>
                )}

                {!isResolved && (
                  <button
                    onClick={() => { setResolveTarget(fb); setResolveNotes(""); setResolveError(null); }}
                    className="mt-1 px-3 py-1.5 bg-[#626F47] text-[#F5ECD5] font-semibold text-[length:var(--fs-sm)] rounded-[8px]"
                  >
                    {t("manager.settings.markResolved")}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Resolve Modal */}
      {resolveTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-[#FDFAF3] rounded-t-[20px] p-5 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-[length:var(--fs-lg)] text-[#2C2F1E]">
                {t("manager.settings.markResolved")}
              </h3>
              <button
                onClick={() => { setResolveTarget(null); setResolveError(null); }}
                className="w-8 h-8 flex items-center justify-center text-[#6B7550]"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-[length:var(--fs-md)] text-[#6B7550] mb-3 italic">
              "{resolveTarget.complaint ?? resolveTarget.message}"
            </p>

            {resolveError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[length:var(--fs-md)] text-red-700">
                {resolveError}
              </div>
            )}

            <div className="mb-4">
              <label className="text-[length:var(--fs-xs)] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-1.5 block">
                {t("manager.settings.resolveNotes")}
              </label>
              <textarea
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                rows={3}
                className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[10px] text-[length:var(--fs-base)] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47] resize-none"
              />
            </div>

            <button
              onClick={handleResolve}
              disabled={resolving}
              className="w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[length:var(--fs-base)] py-[12px] rounded-[10px] disabled:opacity-60"
            >
              {resolving ? t("manager.settings.resolving") : t("manager.settings.resolve")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
