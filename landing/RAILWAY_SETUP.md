# Nasazení Flask API na Railway (5 minut)

Pro fungování nahrávání a exportu souborů musí běžet Flask API. Railway je zdarma pro malé projekty.

## 1. Vytvoř účet na Railway

https://railway.app → Sign up (např. přes GitHub)

## 2. Nový projekt

1. **New Project** → **Deploy from GitHub repo**
2. Vyber **NAPOJENO/PWCHECK** (nebo tvůj fork)
3. Railway automaticky detekuje Procfile

## 3. Nastavení

1. Klikni na službu → **Settings**
2. **Root Directory**: nech prázdné (kořen repo)
3. **Start Command**: `pip install -r requirements_web.txt && python web/app.py`
4. **Environment Variables** (Variables tab):
   - `SUPABASE_URL` = tvoje Supabase URL
   - `SUPABASE_ANON_KEY` = Supabase anon key
   - `ALLOWED_ORIGINS` = `https://tvoje-app.vercel.app` (URL tvého Vercel deploye)
   - `SECRET_KEY` = nějaký náhodný řetězec (pro session)

## 4. Získej URL

1. **Settings** → **Networking** → **Generate Domain**
2. Zkopíruj URL (např. `https://pwcheck-production-xxx.up.railway.app`)

## 5. Nastav Vercel

V projektu na Vercel → **Settings** → **Environment Variables**:

- `PUBLIC_API_URL` = `https://tvoje-railway-url.up.railway.app/api`

(Přidej `/api` na konec – Flask má routy `/api/upload`, `/api/export` atd.)

## 6. Redeploy

Vercel → **Redeploy** (aby se načetlo nové PUBLIC_API_URL)

Hotovo. Nahrávání a export by teď mělo fungovat.
