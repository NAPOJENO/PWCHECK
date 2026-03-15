import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useStore } from "@nanostores/react";
import { tStore } from "../stores/translations";
import { useState } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function CTA() {
  const container = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const t = useStore(tStore);

  useGSAP(
    () => {
      gsap.from(contentRef.current, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top 80%",
        },
      });
    },
    { scope: container, dependencies: [t.cta.title] }
  );

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Chyba při vytváření platby");
      }
    } catch (err) {
      console.error(err);
      alert(
        "Stripe není zatím nakonfigurován. Přidejte STRIPE_SECRET_KEY a STRIPE_PRICE_ID do proměnných prostředí."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="cta"
      ref={container}
      className="py-24 px-6"
    >
      <div
        ref={contentRef}
        className="max-w-3xl mx-auto text-center backdrop-blur-xl bg-gradient-to-b from-emerald-500/10 to-sky-500/10 rounded-3xl border border-white/10 p-12 md:p-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t.cta.title}
        </h2>
        <p className="text-slate-300 text-lg mb-8">{t.cta.subtitle}</p>
        <button
          onClick={handlePurchase}
          disabled={loading}
          className="px-10 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-semibold text-lg transition-all hover:scale-105"
        >
          {loading ? "..." : t.cta.button}
        </button>
      </div>
    </section>
  );
}
