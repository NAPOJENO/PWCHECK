# PVCHECK Export – Landing Page

Prodejní landing page pro aplikaci PVCHECK Export. Astro + React, GSAP animace, Stripe platba, přepínač CS/EN.

## Vývoj

```bash
npm install
npm run dev
```

Otevři http://localhost:4321

## Build

```bash
npm run build
```

## Deploy na Vercel

1. Propoj repozitář s Vercel
2. Root directory: `landing`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Přidej env proměnné:
   - `STRIPE_SECRET_KEY` – tajný klíč ze Stripe Dashboard
   - `STRIPE_PRICE_ID` – ID ceny produktu (30 000 Kč)
   - `STRIPE_SUCCESS_URL` – URL po úspěšné platbě (volitelné)
   - `STRIPE_CANCEL_URL` – URL při zrušení (volitelné)

## Stripe nastavení

1. Vytvoř produkt v Stripe Dashboard
2. Nastav jednorázovou cenu 30 000 CZK
3. Zkopíruj Price ID do `STRIPE_PRICE_ID`
