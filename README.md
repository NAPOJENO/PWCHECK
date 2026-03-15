# PVCHECK Export

Landing page + aplikace pro export měření FV z .ZST souborů.

## Struktura projektu

- **landing/** – Astro + React (landing + aplikace na `/app`)
- **web/** – Flask API (zpracování .ZST, export CSV)
- **pvcheck_export/** – Python knihovna pro načítání ZST souborů

## Lokální vývoj

### 1. Landing (port 4321)

```bash
cd landing
npm install
npm run dev
```

### 2. Flask API (port 5000)

```bash
pip install -r requirements_web.txt
python web/app.py
```

### 3. Otevři

- Landing: http://localhost:4321
- Aplikace: http://localhost:4321/app

## Nasazení na Vercel

1. **Připoj repo** na [vercel.com](https://vercel.com)
2. **Root Directory** nastav na `landing`
3. **Environment variables** v Vercel:
   - `PUBLIC_SUPABASE_URL` – Supabase URL
   - `PUBLIC_SUPABASE_ANON_KEY` – Supabase anon key
   - `PUBLIC_APP_URL` – URL aplikace (např. `https://tvoje-app.vercel.app/app`)
   - `PUBLIC_API_URL` – (volitelně) URL Flask API, pokud běží jinde

4. **Flask API** – pro plnou funkčnost nahraj/export musí běžet Flask. Možnosti:
   - [Railway](https://railway.app), [Render](https://render.com) nebo jiný Python hosting
   - Pak nastav `PUBLIC_API_URL` na URL Flask API

## Přihlášení

- **Supabase** – přihlášení na landingu, přesměrování na `/app` (vyžaduje nákup v `pvcheck_purchases`)
- **Admin** – v aplikaci tlačítko „Admin přihlášení“ (admin/admin)
