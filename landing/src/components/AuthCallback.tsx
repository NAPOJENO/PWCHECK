import { useEffect, useState } from "react";
import { supabase, PURCHASES_TABLE } from "../lib/supabase";

const APP_URL = import.meta.env.PUBLIC_APP_URL || (typeof window !== "undefined" ? `${window.location.origin}/app` : "/app");

export default function AuthCallback() {
  const [status, setStatus] = useState<"loading" | "redirect" | "no-access" | "error">("loading");

  useEffect(() => {
    if (!supabase) {
      setStatus("error");
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error || !session?.user) {
        setStatus("error");
        return;
      }

      const { data } = await supabase
        .from(PURCHASES_TABLE)
        .select("id")
        .eq("user_id", session.user.id)
        .limit(1)
        .maybeSingle();

      if (data) {
        setStatus("redirect");
        window.location.href = `${APP_URL}?token=${session.access_token}`;
      } else {
        setStatus("no-access");
        setTimeout(() => {
          window.location.href = "/#cta";
        }, 2500);
      }
    });
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        {status === "loading" && (
          <p className="text-slate-400">Dokončuji přihlášení…</p>
        )}
        {status === "redirect" && (
          <p className="text-emerald-400">Přesměrování do aplikace…</p>
        )}
        {status === "no-access" && (
          <p className="text-slate-300">
            Přístup vyžaduje zakoupení. Přesměrování na nákup…
          </p>
        )}
        {status === "error" && (
          <p className="text-rose-400">
            Chyba přihlášení.{" "}
            <a href="/" className="text-emerald-400 hover:underline">
              Zpět na úvodní stránku
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
