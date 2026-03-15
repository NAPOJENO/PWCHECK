# Spuštění landing page

## Z této složky (ZAKÁZKY)

**Build + preview** – funguje vždy:
```bash
npm run dev:build
```
Sestaví projekt a spustí server. Otevři http://localhost:4321 (bez hot reload – po změně znovu spusť).

**Dev s hot reload** – použij skript:
```bash
npm run dev:safe
```
Zkopíruje projekt do `~/pvcheck-landing-dev` a spustí tam (obchází chybu s cestou).

## Proč

`npm run dev` přímo tady selhává kvůli cestě `ZAKÁZKY` (znak `á`). Build a preview fungují.
