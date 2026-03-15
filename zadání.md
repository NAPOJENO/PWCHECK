## Cíl aplikace

Webová aplikace, která:
- umožní jednoduché **přihlášení** (uživatel `admin`, heslo `admin`),
- umožní **nahrát více souborů** s výstupy z měřicích přístrojů (PVCHECK `.ZST`),
- z těchto souborů zjistí dostupné **sloupce/datové položky**,
- nabídne uživateli **přehledný výběr sloupců** (s popisem významu),
- po potvrzení vygeneruje a nabídne ke stažení **CSV soubor** obsahující jen vybrané sloupce, přičemž každý řádek = jedno měření.

## Uživatelské scénáře

1. **Přihlášení**
   - Uživatel otevře aplikaci v prohlížeči.
   - Zobrazí se přihlašovací formulář (uživatelské jméno + heslo).
   - Uživatel zadá `admin` / `admin`.
   - Při správných údajích je přesměrován na hlavní stránku aplikace.

2. **Nahrání měřicích souborů**
   - Na hlavní stránce je sekce „Nahrát soubory“.
   - Uživatel může vybrat **více souborů `.ZST`** (multi-file upload).
   - Po potvrzení (např. tlačítko „Načíst data“) se soubory nahrají na server do dočasného úložiště.
   - Backend interně použije existující logiku (z `pvcheck_export.py`) k:
     - rozbalení archivu,
     - načtení Excelu `Data`,
     - zjištění všech možných sloupců napříč všemi soubory.

3. **Výběr sloupců**
   - Po úspěšném zpracování se zobrazí seznam všech dostupných sloupců.
   - Seznam bude rozdělen do **logických skupin** (pro přehlednost):
     - **Identifikační a obecné informace**
       - `source_file` – název vstupního souboru (který přístroj / export).
       - `Name` – typ testu/měření (např. „I-V Check“, „MΩ Campo“).
       - `M1`, `M2`, `M3` – hierarchie nebo úroveň (např. plant/string/module).
       - `Num` – interní číslo měření.
       - `Type` – typ záznamu (kód).
       - `Lenght` – délka nebo počet vzorků (podle významu v originálním souboru).
       - `DateTime` – datum a čas měření.
       - `text`, `userText` – textová pole / poznámky operátora.
       - `outC`, `AHI`, `Valtxt`, `ValVal`, `ValMU` – další metadata z původního souboru.
     - **Elektrické parametry a IV charakteristika**
       - `I Test` / `I Test_unit` – testovací proud.
       - `Voc opc` / `Voc opc_unit` – napětí naprázdno při provozních podmínkách.
       - `Isc opc` / `Isc opc_unit` – zkratový proud při provozních podmínkách.
       - `Voc stc` / `Voc stc_unit` – napětí naprázdno přepočtené na STC.
       - `Isc stc` / `Isc stc_unit` – zkratový proud přepočtený na STC.
       - `Voc avg` / `Voc avg_unit` – průměrné Voc.
       - `Isc avg` / `Isc avg_unit` – průměrné Isc.
       - `V0 nom`, `V0 nom_unit` – nominální napětí.
       - `Vnom`, `Vnom_unit` – další nominální napětí (případně řetězce).
       - `Vtest`, `Vtest_unit` – testovací napětí.
       - `VEN`, `VEN_unit`, `VEP`, `VEP_unit`, `VPN`, `VPN_unit`, `Vmis (-)`, `Vmis (-)_unit` – různé napěťové úrovně a odchylky.
     - **Podmínky měření a prostředí**
       - `Irraggiamento`, `Irraggiamento_unit` – ozáření (irradiance), např. W/m².
       - `Irraggiamento minimo`, `Irraggiamento minimo_unit` – minimální hodnoty ozáření.
       - `Temperatura`, `Temperatura_unit` – teplota (pravděpodobně modul nebo okolní).
       - `Modalità temperatura`, `Modalità temperatura_unit` – režim měření teploty.
       - `Tol I`, `Tol I_unit` – tolerance proudu.
       - `Tol V`, `Tol V_unit` – tolerance napětí.
       - `alpha`, `alpha_unit` – teplotní koeficient (napětí nebo výkonu).
       - `beta`, `beta_unit` – druhý teplotní koeficient.
     - **Izolace, odpor a bezpečnost**
       - `Isolamento`, `Isolamento_unit` – izolační odpor.
       - `R Lim`, `R Lim_unit`, `Rlim`, `Rlim_unit`, `Rmax`, `Rmax_unit` – limity a maximální odpory.
       - `RI`, `RI_unit`, `Ri`, `Ri_unit`, `Ri +`, `Ri +_unit`, `Ri -`, `Ri -_unit` – různé typy odporů, případně fázové rozdělení.
       - `RPE`, `RPE_unit` – ochranný vodič/zemní odpor.
       - `Numero Moduli`, `Numero Moduli_unit` – počet modulů.
       - `Unità remota`, `Unità remota_unit` – informace o vzdálené jednotce.
       - `PVCHECK  S/N 12070024`, `PVCHECK  S/N 12070024_unit` – identifikace zařízení / sériové číslo.
     - **Další / méně používané položky**
       - Všechny ostatní sloupce, které se objeví v datech a nespadají jednoznačně do předchozích kategorií.
   - Uživatel si může jednotlivé sloupce:
     - **zaškrtnout** (checkbox),
     - případně použít **předdefinované presety** (např. „Základní přehled“, „Plná IV analýza“, „Izolační testy“).

4. **Export**
   - Uživatel klikne na tlačítko „Export“.
   - Backend:
     - znovu (nebo z cache) zpracuje všechny nahrané soubory přes logiku z `pvcheck_export.py` (funkce pro načtení dat do tabulky),
     - z připravené plné tabulky **vybere pouze sloupce zvolené uživatelem**,
     - vygeneruje **CSV** soubor:
       - oddělovač `;`,
       - hlavičkový řádek s názvy sloupců,
       - kódování UTF-8.
   - Prohlížeč nabídne stažení souboru (např. `export_pvcheck_YYYYMMDD_HHMM.csv`).

## Funkční požadavky

- **Autentizace**
  - Jednoduché **hardcodované přihlášení** (login formulář + kontrola na backendu).
  - Jméno: `admin`, heslo: `admin`.
  - Po úspěšném přihlášení vytvořit **session** (např. cookie) a chránit hlavní stránku.

- **Nahrávání souborů**
  - Podpora **více souborů najednou** (`multiple` file input).
  - Omezení typu: pouze `.ZST` soubory.
  - Uložení na server do dočasné složky (např. `uploads/`).
  - Validace:
    - soubor je ZIP,
    - obsahuje soubor `Data`,
    - lze ho přečíst pomocí `xlrd`.

- **Zjištění dostupných sloupců**
  - Použít sdílenou logiku z `pvcheck_export.py` tak, aby:
    - byla implementována jako **importovatelný modul** (např. funkce `load_pvcheck_files`),
    - webový backend mohl data číst přímo, bez volání přes `subprocess`.
  - Z načtených řádků (seznam slovníků) odvodit **sjednocený seznam klíčů** (sloupců).
  - Rozdělit klíče do kategorií (viz výše) – definováno v jedné **konfigurační mapě** (např. slovník `COLUMN_GROUPS`).

- **Výběr sloupců – UI**
  - Frontend:
    - zobrazí seznam skupin,
    - v každé skupině seznam sloupců s:
      - **checkboxem**,
      - názvem sloupce (přesně tak, jak je v datech),
      - krátkým popisem (např. „Voc opc – napětí naprázdno při provozních podmínkách“).
  - Nutná možnost:
    - zaškrtnout/odškrtnout celou skupinu najednou,
    - tlačítko „Vybrat vše / Zrušit vše“.

- **Export do CSV**
  - Backend endpoint (např. `POST /export`), který:
    - převezme seznam požadovaných sloupců,
    - načte nebo znovu použije už předzpracovaná data,
    - vytvoří tabulku pouze s vybranými sloupci,
    - vrátí response s hlavičkami pro stažení CSV.
  - Mohou existovat měření, kde některé sloupce nejsou – tyto hodnoty budou prázdné.

## Nefunkční požadavky

- **Jednoduchost nasazení**
  - Aplikace jako **jednoduchý Python backend** (např. Flask nebo FastAPI) + statický frontend (HTML/CSS/JS).
  - Možnost spustit lokálně pomocí `python app.py`.

- **Výkon**
  - Očekávaný počet souborů v jednom běhu: jednotky až desítky.
  - Bude se pracovat v paměti (pandas není nutný; vystačíme si se seznamy slovníků).

- **Bezpečnost**
  - Přihlášení pouze pro interní použití – stačí jednoduchá session.
  - Uložené soubory v dočasné složce s možností mazání po exportu.

## Návrh architektury

- **Backend (Python)**
  - Framework: **Flask** (lehké, jednoduché routy).
  - Moduly:
    - `pvcheck_export.py` – refaktor tak, aby šel importovat (funkce `load_pvcheck_files` atd.).
    - `web/app.py` – hlavní Flask aplikace:
      - `/login` (GET+POST),
      - `/logout`,
      - `/` (hlavní stránka, chráněná loginem),
      - `/upload` (POST, příjem souborů),
      - `/columns` (GET/POST, zobrazení možných sloupců),
      - `/export` (POST, vrácení CSV).
  - Session management: Flask `session` s tajným klíčem.

- **Frontend**
  - Jednoduché **HTML šablony** (Jinja2):
    - `login.html` – formulář pro přihlášení.
    - `index.html` – hlavní obrazovka:
      - formulář pro nahrání souborů,
      - po nahrání seznam dostupných sloupců (checkboxy ve skupinách),
      - tlačítko „Export vybraných sloupců“.
  - CSS:
    - základní responsivní layout,
    - přehledné skupiny (např. accordion/boxy),
    - zvýraznění vybraných sloupců.
  - JavaScript (vanilla nebo minimální knihovna):
    - obsluha výběru skupin (select all / deselect),
    - případně AJAX pro načtení seznamu sloupců bez reloadu stránky.

## API návrh

- `POST /login`
  - Input: `username`, `password`.
  - Output: redirect na `/` při úspěchu, zobrazení chyby při neúspěchu.

- `POST /upload`
  - Input: multipart form-data `files[]` (více `.ZST` souborů).
  - Akce:
    - uložení souborů do `uploads/`,
    - volání interní funkce pro načtení dat,
    - uložení předzpracovaných dat (např. do `session` nebo dočasného souboru/JSON).
  - Output:
    - redirect/render na `/` se zobrazením dostupných sloupců.

- `GET /columns`
  - (Volitelné) endpoint, který vrátí JSON se seznamem sloupců a jejich popisy/skupinami (pro dynamické UI).

- `POST /export`
  - Input:
    - seznam vybraných sloupců (např. jako list v těle požadavku nebo jako pole formuláře).
  - Output:
    - response s content-type `text/csv`,
    - hlavičky pro download (`Content-Disposition: attachment; filename="export_....csv"`),
    - CSV obsahující jen vybrané sloupce.

## Postup implementace

1. **Refaktor stávajícího skriptu**
   - Ujistit se, že `pvcheck_export.py` má jasně oddělenou logiku:
     - funkce pro načtení a parsování dat z `.ZST` → seznam slovníků,
     - funkce pro export do CSV (už nyní existuje).
   - Připravit samostatný modul (např. `pvcheck_core.py`), který bude použit jak CLI skriptem, tak webovým backendem.

2. **Skeleton Flask aplikace**
   - Vytvořit `web/app.py` s routami `/login`, `/`, `/logout`.
   - Nastavit session a jednoduchou autentizaci.

3. **Upload souborů**
   - Implementovat `POST /upload`:
     - uložení souborů,
     - zavolání funkce z `pvcheck_core` pro načtení všech dat,
     - uložit výslednou tabulku (plnou, se všemi sloupci) do paměti/dočasného souboru.

4. **Zobrazení seznamu sloupců**
   - Z dat odvodit seznam dostupných sloupců.
   - Připravit mapování `sloupec → skupina + popis`.
   - Šablona `index.html` zobrazí checkboxy sloupců podle skupin.

5. **Export vybraných sloupců**
   - Implementovat `POST /export`:
     - přečíst seznam vybraných sloupců,
     - z plné tabulky vyfiltrovat pouze tyto sloupce,
     - vygenerovat CSV a poslat ho jako download.

6. **Testování**
   - Otestovat přihlášení (správné/špatné heslo).
   - Otestovat nahrání jednoho i více souborů.
   - Otestovat různé kombinace vybraných sloupců (např. jen základní, jen IV parametry, vše).
   - Zkontrolovat, že chybějící hodnoty jsou prázdné a CSV je konzistentní.

7. **Nasazení a úklid**
   - Přidat `requirements_web.txt` (Flask atd.).
   - Přidat README s instrukcemi, jak web spustit lokálně.
   - Volitelně přidat čištění dočasných souborů.

## Možná budoucí rozšíření

- Přidání **uživatelských účtů** a práv (více než jeden login).
- Ukládání historie exportů.
- Uložení často používaných **presetů sloupců** na uživatele.
- Export přímo do databáze (např. PostgreSQL) místo CSV.
- Přidání grafického náhledu (grafy IV charakteristiky pro vybraná měření).

