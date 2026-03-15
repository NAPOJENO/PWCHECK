import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useStore } from "@nanostores/react";
import { tStore } from "../stores/translations";
import { useState } from "react";

gsap.registerPlugin(ScrollTrigger);

const FAQ_ITEMS = [
  { q: "q1" as const, a: "a1" as const },
  { q: "q2" as const, a: "a2" as const },
  { q: "q3" as const, a: "a3" as const },
  { q: "q4" as const, a: "a4" as const },
  { q: "q5" as const, a: "a5" as const },
] as const;

export default function FAQ() {
  const container = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const t = useStore(tStore);

  useGSAP(
    () => {
      gsap.from(titleRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top 85%",
        },
      });
    },
    { scope: container, dependencies: [t.faq.title] }
  );

  return (
    <section ref={container} className="py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <h2
          ref={titleRef}
          className="text-2xl md:text-3xl font-bold text-white mb-12 text-center"
        >
          {t.faq.title}
        </h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map(({ q, a }, index) => (
            <div
              key={q}
              className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <span className="font-medium text-white">{t.faq[q]}</span>
                <span
                  className={`text-slate-400 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-slate-400 text-sm">
                  {t.faq[a]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
