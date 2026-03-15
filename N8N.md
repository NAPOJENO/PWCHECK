# Použití v n8n

Skript `pvcheck_export.py` lze v n8n volat tak, že zaměstnanec nahraje více souborů `.ZST` a výsledkem bude jedna sloučená tabulka (CSV nebo JSON).

## Závislosti

- Python 3 + `xlrd`: `pip install xlrd`

## Varianta 1: Soubory na disku (doporučeno)

1. **Upload souborů** – v n8n workflow nejdřív ulož nahrané soubory do složky (např. pomocí „Read Binary File“ nebo „Move Binary Data“ do dočasné složky).
2. **Execute Command** – spusť skript s cestami k souborům a výstupním CSV:

   ```bash
   python3 /cesta/k/pvcheck_export.py /cesta/k/slozky/*.ZST -o /cesta/k/vysledek.csv
   ```

   Případně předat konkrétní seznam souborů (např. z předchozího kroku):

   ```bash
   python3 /cesta/k/pvcheck_export.py "{{ $json.path1 }}" "{{ $json.path2 }}" -o /cesta/k/vysledek.csv
   ```

3. **Výstup** – soubor `vysledek.csv` obsahuje všechny měření ze všech souborů; sloupec `source_file` udává původní název souboru.

## Varianta 2: Výstup na stdout (JSON pro další uzly)

Pokud nechceš zapisovat do souboru, můžeš výstup poslat na stdout a v n8n ho zpracovat:

- **CSV na stdout:** neuvádět `-o`, skript vypíše CSV na stdout.
- **JSON:** přidat `--json`, výstup bude JSON pole (jeden objekt na měření).

Příklad (Execute Command, výstup do položky):

```bash
python3 /cesta/k/pvcheck_export.py /cesta/k/soubory/*.ZST --json
```

V n8n pak můžeš výstup uzlu „Execute Command“ napojit na další uzly (např. „Set“ pro uložení do proměnné nebo zápis do DB).

## Příklad workflow v n8n

1. **Trigger** – např. „Webhook“ nebo „Form Trigger“ pro nahrání souborů.
2. **Uložení souborů** – uložit binární data do dočasné složky (každý soubor = jeden soubor na disku).
3. **Code / Run Once** – sestavit seznam cest k uloženým `.ZST` souborům.
4. **Execute Command** – volat `pvcheck_export.py` s těmito cestami a `-o vysledek.csv`.
5. **Další krok** – číst `vysledek.csv` (Read Binary File) nebo ho poslat e-mailem / uložit do úložiště.

## Parametry skriptu

| Parametr | Popis |
|----------|--------|
| `files` | Jedna nebo více cest k `.ZST` souborům, nebo cesta k adresáři (zpracují se všechny `.ZST` v něm). |
| `-o`, `--output` | Výstupní soubor (CSV nebo JSON podle přípony / `--json`). |
| `--json` | Výstup v JSON místo CSV. |
| `--no-source` | Nepřidávat sloupec `source_file`. |

## Výstupní tabulka

- **Jeden řádek = jedno měření** z jednoho souboru.
- **Sloupce:** `source_file`, pevné pole (Name, M1, M2, M3, Num, Type, DateTime, …), potom pro každý typ měření dvojice sloupců: `Název měření` a `Název měření_unit` (např. `Voc opc`, `Voc opc_unit`).
- Chybějící hodnoty u některých měření jsou prázdné; sloupce jsou sjednoceny napříč všemi řádky/soubory.
