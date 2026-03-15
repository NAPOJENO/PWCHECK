# PVCHECK Export – webová aplikace

## Spuštění

```bash
# Z kořene projektu (kroupa)
pip install -r requirements_web.txt
python3 web/app.py
```

Aplikace běží na **http://127.0.0.1:5000**

## Přihlášení

- **Uživatel:** `admin`
- **Heslo:** `admin`

Nebo přihlášení přes **landing** (Supabase) – po přihlášení na landing se přesměruje sem s tokenem.

**Důležité:** Aby přihlášení z landingu fungovalo, musí být Flask app spuštěná (localhost:5000). V `web/.env` musí být `SUPABASE_URL` a `SUPABASE_ANON_KEY`.

## Postup

1. Přihlásit se.
2. Vybrat jeden nebo více souborů `.ZST` (výstupy z měřicích přístrojů) a kliknout **Načíst data**.
3. Zaškrtnout sloupce, které chcete exportovat (lze vybrat/zrušit celou skupinu nebo vše).
4. Kliknout **Export CSV** – stáhne se soubor `export_pvcheck_YYYYMMDD_HHMM.csv`.

Složka `uploads/` slouží pro dočasné uložení nahraných souborů; po zpracování se soubory mažou.
