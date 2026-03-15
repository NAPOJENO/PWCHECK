import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useStore } from "@nanostores/react";
import { tStore } from "../stores/translations";

gsap.registerPlugin(ScrollTrigger);

export default function Features() {
  const container = useRef<HTMLElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);

  const t = useStore(tStore);

  useGSAP(
    () => {
      // Problém - animace při scrollu
      gsap.from(problemRef.current, {
        y: 60,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: problemRef.current,
          start: "top 80%",
        },
      });

      // Řešení - animace při scrollu
      gsap.from(solutionRef.current, {
        y: 60,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: solutionRef.current,
          start: "top 80%",
        },
      });

      // Výhody - stagger pro karty
      const benefitCards = benefitsRef.current?.querySelectorAll(".benefit-card");
      if (benefitCards?.length) {
        gsap.from(benefitCards, {
          y: 50,
          opacity: 0,
          stagger: 0.15,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: benefitsRef.current,
            start: "top 80%",
          },
        });
      }
    },
    { scope: container, dependencies: [t.problem.title] }
  );

  const benefits = [
    { key: "speed" as const, icon: "⚡" },
    { key: "compliance" as const, icon: "✓" },
    { key: "roi" as const, icon: "↗" },
    { key: "quality" as const, icon: "★" },
  ];

  return (
    <section ref={container} className="py-24 px-6">
      <div className="max-w-4xl mx-auto space-y-32">
        {/* Problém */}
        <div
          id="problem"
          ref={problemRef}
          className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 md:p-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            {t.problem.title}
          </h2>
          <p className="text-slate-300 text-lg mb-8">{t.problem.description}</p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {t.problem.point1}
            </li>
            <li className="flex items-center gap-3 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {t.problem.point2}
            </li>
            <li className="flex items-center gap-3 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {t.problem.point3}
            </li>
          </ul>
        </div>

        {/* Řešení */}
        <div
          id="solution"
          ref={solutionRef}
          className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 md:p-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            {t.solution.title}
          </h2>
          <p className="text-slate-300 text-lg mb-8">{t.solution.description}</p>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 font-semibold">1.</span>{" "}
              {t.solution.step1}
            </div>
            <div className="flex-1 p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
              <span className="text-sky-400 font-semibold">2.</span>{" "}
              {t.solution.step2}
            </div>
            <div className="flex-1 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 font-semibold">3.</span>{" "}
              {t.solution.step3}
            </div>
          </div>
        </div>

        {/* Výhody */}
        <div ref={benefitsRef}>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-12 text-center">
            {t.benefits.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map(({ key, icon }) => (
              <div
                key={key}
                className="benefit-card backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 hover:bg-white/8 transition-colors"
              >
                <span className="text-3xl mb-4 block">{icon}</span>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t.benefits[key].title}
                </h3>
                <p className="text-slate-400">{t.benefits[key].desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
