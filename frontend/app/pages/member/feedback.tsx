import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { MessageSquare, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchFeedback } from "~/redux/features/memberSlice";
import { post } from "~/services/httpMethods/post";
import { getErrorMessage } from "~/utils/errorHandler";

type FormData = { complaint: string };

export default function FeedbackPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { feedback, isLoading } = useAppSelector((s) => s.member);
  const messId = useAppSelector((s) => s.mess.mess?.id);
  const [showForm, setShowForm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = z.object({
    complaint: z.string().min(10, t("validation.messageMin10")),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    dispatch(fetchFeedback());
  }, [dispatch]);

  async function onSubmit(data: FormData) {
    if (!messId) return;
    setServerError(null);
    try {
      await post(`/messes/${messId}/feedback`, {
        complaint: data.complaint,
        date: format(new Date(), "yyyy-MM-dd"),
      });
      reset();
      setShowForm(false);
      dispatch(fetchFeedback());
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-[20px] text-[#F5ECD5]">
              {t("member.feedback.title")}
            </h1>
            <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
              {t("member.feedback.subtitle")}
            </p>
          </div>
          <button
            aria-label={showForm ? t("member.feedback.close") : t("member.feedback.newFeedback")}
            onClick={() => setShowForm(!showForm)}
            className="w-9 h-9 bg-[#F0BB78] rounded-full flex items-center justify-center text-[#2C2F1E]"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 max-w-[640px] mx-auto">
        {showForm && (
          <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-5 mb-4">
            {serverError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700">
                {serverError}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-4">
                <label
                  htmlFor="feedback-complaint"
                  className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-1.5 block"
                >
                  {t("member.feedback.message")}
                </label>
                <textarea
                  {...register("complaint")}
                  id="feedback-complaint"
                  rows={4}
                  placeholder={t("member.feedback.messagePlaceholder")}
                  className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[10px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47] placeholder:text-[#C0B090] resize-none"
                />
                {errors.complaint && (
                  <p className="mt-1 text-[12px] text-red-600">
                    {errors.complaint.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[14px] py-[11px] rounded-[10px] disabled:opacity-60"
              >
                {isSubmitting ? t("member.feedback.submitting") : t("member.feedback.submit")}
              </button>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : feedback.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-[rgba(98,111,71,0.1)] rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={28} className="text-[#A09070]" />
            </div>
            <p className="text-[14px] text-[#6B7550] font-semibold">
              {t("member.feedback.noData")}
            </p>
            <p className="text-[12px] text-[#A09070] mt-1">
              {t("member.feedback.noDataDesc")}
            </p>
          </div>
        ) : (
          feedback.map((fb) => (
            <div
              key={fb.id}
              className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[14px] p-4 mb-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-semibold text-[14px] text-[#2C2F1E]">
                  {fb.date}
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${fb.status === "resolved" ? "bg-[rgba(98,111,71,0.12)] text-[#626F47]" : "bg-[rgba(240,187,120,0.18)] text-amber-700"}`}
                >
                  {fb.status}
                </span>
              </div>
              <p className="text-[13px] text-[#6B7550]">{fb.complaint}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
