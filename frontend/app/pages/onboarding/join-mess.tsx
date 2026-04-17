import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Search, Hash, ArrowLeft, CheckCircle, Building2 } from "lucide-react";
import { useNavigate } from "react-router";
import { get } from "~/services/httpMethods/get";
import { post } from "~/services/httpMethods/post";
import { getErrorMessage } from "~/utils/errorHandler";

type FormData = { messCode: string };

type MessPreview = {
  id: string;
  name: string;
  address: string;
  messId: string;
};

export default function JoinMessPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [preview, setPreview] = useState<MessPreview | null>(null);
  const [success, setSuccess] = useState(false);
  const [joining, setJoining] = useState(false);

  const schema = z.object({
    messCode: z.string().min(4, t("validation.validMessCode")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSearch(data: FormData) {
    setServerError(null);
    setPreview(null);
    try {
      const result = await get<{ data: MessPreview[]; total: number }>(
        "/messes/search",
        { q: data.messCode },
      );
      if (!result.data.length) {
        setServerError(t("joinMess.notFound"));
        return;
      }
      setPreview(result.data[0]);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  async function onJoin() {
    if (!preview) return;
    setServerError(null);
    setJoining(true);
    try {
      await post(`/messes/${preview.id}/join-requests`, {});
      setSuccess(true);
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setJoining(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5ECD5] flex items-center justify-center px-4">
        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-[#626F47] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-[#F5ECD5]" />
          </div>
          <h2 className="font-display font-bold text-[20px] text-[#2C2F1E] mb-2">
            {t("joinMess.successTitle")}
          </h2>
          <p className="text-[13px] text-[#6B7550] mb-6">
            {t("joinMess.successDesc")}
          </p>
          <button
            onClick={() => navigate("/onboarding/role-selection")}
            className="w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[15px] py-[13px] rounded-[12px]"
          >
            {t("joinMess.toDashboard")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5ECD5]">
      <div className="bg-[#626F47] px-5 pt-6 pb-7 relative overflow-hidden">
        <div className="relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[rgba(245,236,213,0.8)] text-[14px] mb-5"
          >
            <ArrowLeft size={18} /> {t("common.back")}
          </button>
          <div className="w-12 h-12 bg-[#F0BB78] rounded-[14px] flex items-center justify-center mb-4">
            <Search size={24} className="text-[#2C2F1E]" />
          </div>
          <h2 className="font-display font-bold text-[22px] text-[#F5ECD5] mb-1">
            {t("joinMess.title")}
          </h2>
          <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
            {t("joinMess.subtitle")}
          </p>
        </div>
      </div>

      <div className="px-4 pt-6 max-w-[520px] mx-auto">
        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-5">
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700">
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSearch)} noValidate>
            <div className="mb-5">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-2">
                <Hash size={12} /> {t("joinMess.codeLabel")}
              </label>
              <input
                {...register("messCode")}
                type="text"
                placeholder={t("joinMess.codePlaceholder")}
                className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[11px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47] placeholder:text-[#C0B090] uppercase tracking-wider"
              />
              {errors.messCode && (
                <p className="mt-1 text-[12px] text-red-600">
                  {errors.messCode.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#626F47] text-[#F5ECD5] font-bold text-[15px] py-[13px] rounded-[12px] disabled:opacity-60"
            >
              <Search size={18} />
              {isSubmitting ? t("joinMess.searching") : t("joinMess.searchMess")}
            </button>
          </form>

          {preview && (
            <div className="mt-5 pt-5 border-t border-[#D9CEB4]">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-[rgba(98,111,71,0.12)] rounded-[10px] flex items-center justify-center shrink-0">
                  <Building2 size={20} className="text-[#626F47]" />
                </div>
                <div className="flex-1">
                  <div className="font-display font-bold text-[15px] text-[#2C2F1E]">
                    {preview.name}
                  </div>
                  <div className="text-[12px] text-[#6B7550]">{preview.address}</div>
                  <div className="text-[11px] text-[#A09070] mt-0.5">
                    {preview.messId}
                  </div>
                </div>
              </div>
              <button
                onClick={onJoin}
                disabled={joining}
                className="w-full flex items-center justify-center gap-2 bg-[#F0BB78] text-[#2C2F1E] font-bold text-[15px] py-[13px] rounded-[12px] hover:bg-[#E8A85E] transition-colors disabled:opacity-60"
              >
                {joining ? t("joinMess.requesting") : t("joinMess.requestJoin")}
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-start gap-2 p-3 bg-[rgba(98,111,71,0.07)] rounded-[10px]">
          <Hash size={14} className="text-[#626F47] mt-0.5 shrink-0" />
          <p className="text-[11px] text-[#6B7550]">{t("joinMess.hint")}</p>
        </div>
      </div>
    </div>
  );
}
