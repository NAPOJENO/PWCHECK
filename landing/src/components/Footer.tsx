import { useStore } from "@nanostores/react";
import { tStore } from "../stores/translations";

export default function Footer() {
  const t = useStore(tStore);

  return (
    <footer className="border-t border-white/10 py-8 mt-24">
      <div className="max-w-6xl mx-auto px-6 text-center text-slate-400 text-sm">
        <p>{t.footer.copyright}</p>
      </div>
    </footer>
  );
}
