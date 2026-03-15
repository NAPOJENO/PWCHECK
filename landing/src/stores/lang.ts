import { atom } from "nanostores";

export type Lang = "cs" | "en";

export const langStore = atom<Lang>("cs");

export function setLang(lang: Lang) {
  langStore.set(lang);
  if (typeof window !== "undefined") {
    localStorage.setItem("pvcheck-lang", lang);
  }
}

export function initLang() {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("pvcheck-lang") as Lang | null;
    if (saved === "cs" || saved === "en") {
      langStore.set(saved);
    }
  }
}
