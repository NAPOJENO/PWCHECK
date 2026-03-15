import { useState } from "react";
import { useStore } from "@nanostores/react";
import { tStore } from "../stores/translations";
import LanguageToggle from "./LanguageToggle";
import LoginModal from "./LoginModal";

export default function Header() {
  const t = useStore(tStore);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 pb-2">
        <nav className="max-w-6xl mx-auto flex items-center justify-between backdrop-blur-2xl bg-white/[0.06] rounded-2xl border border-white/[0.12] shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_8px_32px_-8px_rgba(0,0,0,0.3)] px-6 py-3">
          <a
            href="#"
            className="text-xl font-bold tracking-tight text-white/95 hover:text-white transition-colors"
          >
            {t.nav.appName}
          </a>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => setLoginOpen(true)}
              className="px-4 py-2 rounded-xl backdrop-blur-sm bg-white/[0.08] border border-white/[0.15] hover:bg-white/[0.12] hover:border-white/[0.2] text-white/95 font-medium transition-all duration-300"
            >
              {t.nav.login}
            </button>
            <a
              href="#cta"
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-emerald-500/90 hover:border-emerald-400/50 text-white font-medium transition-all duration-300 shadow-[0_0_20px_-5px_rgba(34,197,94,0.2)]"
            >
              {t.nav.buy}
            </a>
          </div>
        </nav>
      </header>
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
