# Řešení chyby "Cannot read properties of undefined (reading 'call')"

## Příčina

Kombinace **Astro 6 + Vite 7** způsobovala chybu v EnvironmentPluginContainer.

## Řešení: Downgrade na Astro 5

Projekt byl převeden na **Astro 5** s **Tailwind 3** a **@astrojs/tailwind**. Tato kombinace funguje stabilně.

## Po změně – restart serveru

1. Zastav všechny běžící servery (Ctrl+C v terminálech)
2. Případně ukonči procesy na portech 4321–4324:
   ```bash
   lsof -ti:4321,4322,4323,4324 | xargs kill -9 2>/dev/null
   ```
3. Spusť znovu: `npm run dev`
4. Otevři http://localhost:4321 (nebo port, který Astro vypíše)
