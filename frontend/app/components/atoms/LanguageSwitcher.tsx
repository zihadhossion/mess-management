import { useTranslation } from "react-i18next";
import i18n from "~/i18n";

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const current = i18n.language;

  const toggle = () => {
    const next = current === "en" ? "bn" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={t("lang.switchLanguage")}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
    >
      <span className={current === "en" ? "text-gray-900 font-semibold" : "text-gray-400"}>
        {t("lang.en")}
      </span>
      <span className="text-gray-300">|</span>
      <span className={current === "bn" ? "text-gray-900 font-semibold" : "text-gray-400"}>
        {t("lang.bn")}
      </span>
    </button>
  );
}
