import { useStore } from "@nanostores/react";
import { langStore, setLang, initLang } from "../stores/lang";
import { loadTranslations } from "../stores/translations";
import { useEffect } from "react";

export default function LanguageToggle() {
  const lang = useStore(langStore);

  useEffect(() => {
    initLang();
  }, []);

  const handleToggle = () => {
    const newLang = lang === "cs" ? "en" : "cs";
    setLang(newLang);
    loadTranslations(newLang);
  };

  return (
    <button
      onClick={handleToggle}
      className="px-3 py-2 rounded-xl backdrop-blur-sm bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.12] text-white/90 text-sm font-medium transition-all duration-300"
      aria-label={lang === "cs" ? "Switch to English" : "Přepnout do češtiny"}
    >
      {lang === "cs" ? "EN" : "CS"}
    </button>
  );
}
