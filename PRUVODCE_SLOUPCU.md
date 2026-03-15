# Průvodce sloupci – co která hodnota znamená

Jednoduchý výklad pro středoškoláka. Měříme **fotovoltaický panel** – zjišťujeme, jestli funguje správně.

---

## Základní informace o měření

| Sloupec | Význam |
|---------|--------|
| **source_file** | Ze kterého souboru data pocházejí |
| **Name** | Název testu (např. „I-V Check“ = měření proudu a napětí) |
| **Num** | Pořadové číslo měření (36, 37, 38…) |
| **DateTime** | Kdy se měřilo (datum a čas) |
| **AHI** | Označení panelu (např. SPR-318E-WTH-) |
| **Valtxt** | Typ testu (např. IV Test) |

---

## Napětí (V = Volty)

Napětí říká, jak „silně“ panel tlačí proud – podobně jako tlak vody v hadici.

| Sloupec | Význam |
|---------|--------|
| **Voc avg** | **Napětí naprázdno** – napětí, když z panelu nic neodvádíš (jako když máš hadici zavřenou) |
| **Voc opc** | Napětí naprázdno při **provozní teplotě** (panel je zahřátý) |
| **Voc stc** | Napětí naprázdno při **STC** – standardních podmínkách (25 °C, 1000 W/m²) |
| **Vnom** | **Nominální napětí** – napětí, na které je panel určen (např. 500 V) |
| **Vtest** | **Testovací napětí** – napětí, při kterém se měří izolace (např. 522 V) |

---

## Proud (A = Ampéry)

Proud říká, kolik elektřiny panel dodává – podobně jako průtok vody.

| Sloupec | Význam |
|---------|--------|
| **Isc avg** | **Zkratový proud** – proud, když zkratuješ vývody (maximální možný proud) |
| **Isc opc** | Zkratový proud při provozní teplotě |
| **Isc stc** | Zkratový proud při standardních podmínkách |
| **I Test** | **Testovací proud** – proud použitý při měření (např. 212 mA) |

---

## Ozáření a teplota

| Sloupec | Význam |
|---------|--------|
| **Irraggiamento** | **Ozáření** (W/m²) – kolik slunečního světla dopadá na panel. 1000 W/m² = plné slunce |
| **Irraggiamento minimo** | Minimální ozáření potřebné pro měření |
| **Temperatura** | **Teplota** panelu (°C). 1000 může znamenat „nastaveno na 25 °C“ nebo jiný režim |

---

## Odpory (Ω = Ohmy)

Odpor říká, jak dobře nebo špatně teče proud – vysoký odpor = špatná vodivost.

| Sloupec | Význam |
|---------|--------|
| **RI** | **Izolační odpor** (MΩ) – jak dobře je panel izolovaný od okolí. Vysoká hodnota = dobrá izolace |
| **RPE** | **Odpor ochranného vodiče** (Ω) – odpor uzemnění. Nízká hodnota = dobré uzemnění |
| **Rlim** | **Limitní odpor** – minimální odpor, který je ještě považován za v pořádku (např. 1 MΩ) |
| **R Lim** | Stejný význam jako Rlim |
| **Rmax** | Maximální měřený odpor |

---

## Bezpečnost a tolerance

| Sloupec | Význam |
|---------|--------|
| **Continuità** | **Kontinuita** – zda je obvod spojitý (0 = OK, jiná hodnota = problém) |
| **Isolamento** | **Izolace** – stav izolace mezi částmi panelu |
| **Tol V** | **Tolerance napětí** (%) – povolená odchylka napětí (např. ±5 %) |
| **Tol I** | **Tolerance proudu** (%) – povolená odchylka proudu (např. ±5 %) |

---

## Teplotní koeficienty

Říkají, jak se panel chová při změně teploty:

| Sloupec | Význam |
|---------|--------|
| **alpha** | **α** (%/°C) – jak se mění **napětí** s teplotou. Např. 0,06 %/°C = při oteplení o 1 °C napětí klesne o 0,06 % |
| **beta** | **β** (%/°C) – jak se mění **proud** s teplotou. Např. -0,273 %/°C = při oteplení proud mírně roste |

---

## Ostatní (technické / nastavení)

| Sloupec | Význam |
|---------|--------|
| **Numero Moduli** | Počet měřených modulů (1 = jeden panel) |
| **Modalità temperatura** | Režim teploty (nastavení přístroje) |
| **Unità remota** | Vzdálená jednotka (0 = nepoužita) |
| **PVCHECK S/N** | Sériové číslo měřicího přístroje |

---

## Shrnutí – co je důležité pro laika

1. **Voc, Isc** – základní výkonové parametry panelu  
2. **RI** – izolace (bezpečnost)  
3. **RPE** – uzemnění (bezpečnost)  
4. **Temperatura, Irraggiamento** – podmínky při měření  
5. **alpha, beta** – chování panelu při změně teploty  

Pokud jsou **RI** a **RPE** v normě a **Voc** a **Isc** odpovídají výrobci, panel je v pořádku.
