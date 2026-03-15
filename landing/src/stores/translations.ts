import { atom } from "nanostores";
import cs from "../i18n/cs.json";
import en from "../i18n/en.json";

export type Translations = typeof cs;

const translations: Record<"cs" | "en", Translations> = { cs, en };

export const tStore = atom<Translations>(cs);

export function loadTranslations(lang: "cs" | "en") {
  tStore.set(translations[lang]);
}
