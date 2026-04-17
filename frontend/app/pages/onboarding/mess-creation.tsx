import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Building2, ArrowLeft } from "lucide-react";
import { post } from "~/services/httpMethods/post";
import { getErrorMessage } from "~/utils/errorHandler";

type FormData = {
  name: string;
  description?: string;
  address: string;
  currency: string;
};

export default function MessCreationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = z.object({
    name: z.string().min(3, t("validation.nameMin3")),
    description: z.string().optional(),
    address: z.string().min(5, t("validation.addressMin5")),
    currency: z.string().min(1, t("validation.required")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "BDT" },
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await post("/messes", data);
      navigate("/onboarding/mess-creation-pending");
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
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
            <Building2 size={24} className="text-[#2C2F1E]" />
          </div>
          <h2 className="font-display font-bold text-[22px] text-[#F5ECD5] mb-1">
            {t("messCreation.title")}
          </h2>
          <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
            {t("messCreation.subtitle")}
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
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {[
              {
                name: "name" as const,
                label: t("messCreation.nameLabel"),
                placeholder: t("messCreation.namePlaceholder"),
                type: "text",
              },
              {
                name: "address" as const,
                label: t("messCreation.addressLabel"),
                placeholder: t("messCreation.addressPlaceholder"),
                type: "text",
              },
              {
                name: "description" as const,
                label: t("messCreation.descLabel"),
                placeholder: t("messCreation.descPlaceholder"),
                type: "text",
              },
            ].map(({ name, label, placeholder, type }) => (
              <div key={name} className="mb-4">
                <label className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-2 block">
                  {label}
                </label>
                <input
                  {...register(name)}
                  type={type}
                  placeholder={placeholder}
                  className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[11px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47] placeholder:text-[#C0B090]"
                />
                {errors[name] && (
                  <p className="mt-1 text-[12px] text-red-600">
                    {errors[name]?.message}
                  </p>
                )}
              </div>
            ))}
            <div className="mb-5">
              <label className="text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] mb-2 block">
                {t("messCreation.currencyLabel")}
              </label>
              <select
                {...register("currency")}
                className="w-full border border-[#D9CEB4] rounded-[10px] px-4 py-[11px] text-[14px] text-[#2C2F1E] bg-[#FDFAF3] outline-none focus:border-[#626F47]"
              >
                <option value="BDT">{t("messCreation.bdtOption")}</option>
                <option value="INR">{t("messCreation.inrOption")}</option>
                <option value="USD">{t("messCreation.usdOption")}</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#626F47] text-[#F5ECD5] font-bold text-[15px] py-[13px] rounded-[12px] disabled:opacity-60"
            >
              {isSubmitting ? t("messCreation.submitting") : t("messCreation.submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
