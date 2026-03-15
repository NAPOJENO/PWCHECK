# Nasazení na GitHub a Vercel

## 1. Vytvoř repozitář na GitHubu

1. Jdi na https://github.com/NAPOJENO
2. Klikni **New repository**
3. Název: **PWCHECK**
4. Nezaškrtávej „Initialize with README“ (projekt už má obsah)
5. Vytvoř repozitář

## 2. Push na GitHub

V terminálu (v složce projektu):

```bash
cd "/Users/martinsimek/Desktop/VIBECODING/ZAKÁZKY/kroupa"
git remote add origin https://github.com/NAPOJENO/PWCHECK.git
git push -u origin main
```

(Pokud už remote existuje: `git remote set-url origin https://github.com/NAPOJENO/PWCHECK.git`)

## 3. Vercel – landing page

1. Jdi na https://vercel.com a přihlas se
2. **Add New** → **Project** → importuj **NAPOJENO/PWCHECK**
3. **Root Directory**: nastav na `landing` (důležité!)
4. **Environment Variables** (Settings → Environment Variables):
   - `PUBLIC_SUPABASE_URL` – tvoje Supabase URL
   - `PUBLIC_SUPABASE_ANON_KEY` – Supabase anon key
   - `PUBLIC_APP_URL` – URL po nasazení, např. `https://pwcheck.vercel.app/app`
5. **Deploy**

## 4. Flask API (pro upload/export)

Landing na Vercelu funguje, ale **nahrání souborů a export** potřebuje běžící Flask API.

Možnosti:

### A) Railway (doporučeno)

1. https://railway.app → New Project → Deploy from GitHub
2. Vyber repo PWCHECK
3. **Root Directory**: `web` (nebo nastav start command)
4. Railway potřebuje `Procfile` nebo `railway.json` – přidej do `web/`:

**web/Procfile:**
```
web: python app.py
```

A v Railway nastav **Start Command**: `pip install -r ../requirements_web.txt && python app.py` (nebo podobně podle struktury)

### B) Render

1. https://render.com → New → Web Service
2. Připoj GitHub repo
3. **Root Directory**: kořen projektu
4. **Build Command**: `pip install -r requirements_web.txt`
5. **Start Command**: `python web/app.py`

### C) Lokálně (pro testování)

Spusť Flask lokálně a v Vercel env nastav `PUBLIC_API_URL` na ngrok/tunnel URL (např. ngrok).

## 5. Po nasazení Flask API

V Vercel Environment Variables přidej:

- `PUBLIC_API_URL` = URL tvého Flask API (např. `https://pwcheck-api.railway.app/api`)

Pak bude aplikace na `/app` volat API a upload/export bude fungovat.
