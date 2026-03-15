import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useStore } from "@nanostores/react";
import { tStore } from "../stores/translations";
import { langStore } from "../stores/lang";
import { useEffect } from "react";
import { loadTranslations } from "../stores/translations";
import { initLang } from "../stores/lang";

export default function Hero() {
  const container = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  const t = useStore(tStore);
  const lang = useStore(langStore);

  // Inicializace jazyka z localStorage a načtení překladů
  useEffect(() => {
    initLang();
    loadTranslations(langStore.get());
  }, []);

  useEffect(() => {
    loadTranslations(lang);
  }, [lang]);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(titleRef.current, {
        y: 60,
        opacity: 0,
        duration: 0.8,
      })
        .from(
          subtitleRef.current,
          {
            y: 40,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.4"
        )
        .from(
          ctaRef.current?.children || [],
          {
            y: 30,
            opacity: 0,
            stagger: 0.15,
            duration: 0.5,
          },
          "-=0.3"
        )
        .from(
          visualRef.current,
          {
            scale: 0.9,
            opacity: 0,
            duration: 0.8,
          },
          "-=1"
        );
    },
    { scope: container, dependencies: [t.hero.title] }
  );

  return (
    <section
      ref={container}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden"
    >
      {/* Pozadí s gradientem */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-950/50 via-slate-950 to-emerald-950/30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1
          ref={titleRef}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
          style={{ fontFamily: "Outfit, system-ui, sans-serif" }}
        >
          {t.hero.title}
        </h1>
        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10"
        >
          {t.hero.subtitle}
        </p>
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#solution"
            className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all hover:scale-105"
          >
            {t.hero.ctaPrimary}
          </a>
          <a
            href="#cta"
            className="px-8 py-4 rounded-xl border border-white/20 hover:bg-white/10 text-white font-semibold transition-all"
          >
            {t.hero.ctaSecondary}
          </a>
        </div>
      </div>

      {/* Animovaný vizuál - data → tabulka */}
      <div
        ref={visualRef}
        className="relative mt-16 w-full max-w-2xl mx-auto"
      >
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-sky-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span className="text-slate-400 text-sm">.ZST soubory</span>
            <span className="text-slate-500">→</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-slate-400 text-sm">CSV export</span>
          </div>
          {/* Mini tabulka – náhled sloupců exportu */}
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-3 py-2 font-medium text-sky-400">Name</th>
                  <th className="px-3 py-2 font-medium text-sky-400">DateTime</th>
                  <th className="px-3 py-2 font-medium text-sky-400">Voc avg</th>
                  <th className="px-3 py-2 font-medium text-sky-400">Isc avg</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="px-3 py-2 text-slate-400">M1-String-A</td>
                  <td className="px-3 py-2 text-slate-500">2024-03-15 10:32</td>
                  <td className="px-3 py-2 text-emerald-400">38.2 V</td>
                  <td className="px-3 py-2 text-emerald-400">9.1 A</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="px-3 py-2 text-slate-400">M1-String-B</td>
                  <td className="px-3 py-2 text-slate-500">2024-03-15 10:35</td>
                  <td className="px-3 py-2 text-emerald-400">37.8 V</td>
                  <td className="px-3 py-2 text-emerald-400">8.9 A</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-slate-400">M1-String-C</td>
                  <td className="px-3 py-2 text-slate-500">2024-03-15 10:38</td>
                  <td className="px-3 py-2 text-emerald-400">38.0 V</td>
                  <td className="px-3 py-2 text-emerald-400">9.0 A</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500">{t.hero.visualCaption}</p>
        </div>
      </div>
    </section>
  );
}
