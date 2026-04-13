import { useTranslation } from "react-i18next";
import i18n from "~/i18n";

export function LanguageSwitcher({ variant = "dark" }: { variant?: "light" | "dark" }) {
  const { t } = useTranslation();
  const current = i18n.language;
  const isLight = variant === "light";

  const toggle = () => {
    const next = current === "en" ? "bn" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={t("lang.switchLanguage")}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
        isLight
          ? "border-[rgba(245,236,213,0.35)] hover:bg-[rgba(245,236,213,0.1)]"
          : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <span
        className={
          current === "en"
            ? isLight
              ? "text-[#F0BB78] font-semibold"
              : "text-gray-900 font-semibold"
            : isLight
            ? "text-[rgba(245,236,213,0.45)]"
            : "text-gray-400"
        }
      >
        {t("lang.en")}
      </span>
      <span className={isLight ? "text-[rgba(245,236,213,0.3)]" : "text-gray-300"}>|</span>
      <span
        className={
          current === "bn"
            ? isLight
              ? "text-[#F0BB78] font-semibold"
              : "text-gray-900 font-semibold"
            : isLight
            ? "text-[rgba(245,236,213,0.45)]"
            : "text-gray-400"
        }
      >
        {t("lang.bn")}
      </span>
    </button>
  );
}
