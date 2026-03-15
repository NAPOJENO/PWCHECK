#!/usr/bin/env python3
"""
Export dat z PVCHECK souborů (.ZST = ZIP s Excel .xls uvnitř) do jedné tabulky.
Každý řádek = jedno měření, sloupce = pevné pole + dynamické hodnoty z měření (název → hodnota, jednotka).

Použití:
  Lokálně:
    python pvcheck_export.py file1.ZST file2.ZST -o vysledek.csv
    python pvcheck_export.py ./slozka_soubory/ -o vysledek.csv
  N8N:
    Execute Command: python3 /cesta/pvcheck_export.py /cesta/soubory/*.ZST -o /cesta/merged.csv
    Bez -o: výstup na stdout (CSV nebo --json). Viz N8N.md.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import os
import sys
import zipfile
from pathlib import Path

try:
    import xlrd
except ImportError:
    xlrd = None

try:
    import pandas as pd
except ImportError:
    pd = None

# Konfigurace struktury Sheet1 (Excel z PVCHECK)
FIXED_COLUMNS = [
    "Name", "M1", "M2", "M3", "Num", "Type", "Lenght", "DateTime",
    "text", "userText", "outC", "AHI", "Valtxt", "ValVal", "ValMU",
]
MEASURE_START_COL = 18   # první trojice: název měření, hodnota, jednotka
MEASURE_STEP = 6         # každých 6 sloupců další měření (name, value, unit + 3 interní)
SHEET_INDEX = 0           # Sheet1


def _is_measurement_name(name: str) -> bool:
    """Považujeme za platný název měření (ne interní kód)."""
    if not name or not name.strip():
        return False
    s = name.strip()
    # Vynechat čistě číselné nebo kódy typu "(+2)"
    if s.startswith("(") and s.endswith(")"):
        return False
    if all(c in "0123456789+-. " for c in s):
        return False
    return True


def _open_workbook_from_zip(zip_path: str | Path) -> tuple[bytes, str]:
    """Otevře .ZST (ZIP), vrátí obsah souboru 'Data' a cestu pro chybové hlášky."""
    path = Path(zip_path)
    with open(path, "rb") as f:
        buf = f.read()
    with zipfile.ZipFile(io.BytesIO(buf), "r") as z:
        if "Data" not in z.namelist():
            raise ValueError(f"V archivu {path.name} chybí soubor 'Data'.")
        return z.read("Data"), str(path)


def _sheet_to_rows(zip_path: str | Path, source_label: str | None) -> list[dict]:
    """
    Načte jeden PVCHECK soubor (ZIP s .xls Data) a vrátí seznam slovníků.
    Každý slovník = jeden řádek tabulky (jedno měření).
    """
    if xlrd is None:
        raise RuntimeError("Pro čtení .xls je potřeba knihovna xlrd: pip install xlrd")

    data_bytes, _ = _open_workbook_from_zip(zip_path)
    wb = xlrd.open_workbook(file_contents=data_bytes)
    sh = wb.sheet_by_index(SHEET_INDEX)

    # Hlavička – pevné sloupce (bereme z prvního řádku, nebo použijeme FIXED_COLUMNS)
    nfixed = len(FIXED_COLUMNS)
    if sh.nrows == 0:
        return []

    rows = []
    for r in range(1, sh.nrows):
        row = {}
        if source_label:
            row["source_file"] = source_label

        # Pevné sloupce
        for i, col_name in enumerate(FIXED_COLUMNS):
            if i < sh.ncols:
                val = sh.cell_value(r, i)
                if isinstance(val, float) and val == int(val):
                    val = int(val)
                row[col_name] = val

        # Dynamická měření (name, value, unit každých MEASURE_STEP)
        c = MEASURE_START_COL
        while c + 2 < sh.ncols:
            name = sh.cell_value(r, c)
            value = sh.cell_value(r, c + 1)
            unit = sh.cell_value(r, c + 2)
            if name and isinstance(name, str) and _is_measurement_name(name):
                name = name.strip()
                if isinstance(value, float) and value == int(value):
                    value = int(value)
                row[name] = value
                row[f"{name}_unit"] = unit if unit else ""
            c += MEASURE_STEP

        rows.append(row)
    return rows


def _normalize_columns(rows: list[dict], measure_names: list[str] | None = None) -> list[dict]:
    """
    Zajistí, že všechny řádky mají stejné sloupce (včetně dynamických).
    Pořadí: source_file, pevné sloupce, pak dvojice (měření, měření_unit).
    """
    if not rows:
        return rows
    all_keys = set()
    for row in rows:
        for k in row:
            all_keys.add(k)
    fixed_set = set(FIXED_COLUMNS) | {"source_file"}
    value_cols = sorted(k for k in all_keys if not k.endswith("_unit") and k not in fixed_set)
    # Za každé měření hned jeho _unit
    col_order = []
    if "source_file" in all_keys:
        col_order.append("source_file")
    col_order += [c for c in FIXED_COLUMNS if c in all_keys]
    for v in value_cols:
        col_order.append(v)
        if f"{v}_unit" in all_keys:
            col_order.append(f"{v}_unit")

    out = []
    for row in rows:
        normalized = {k: row.get(k, "") for k in col_order}
        out.append(normalized)
    return out


def load_pvcheck_files(paths: list[str | Path], include_source: bool = True) -> list[dict]:
    """
    Načte jeden nebo více PVCHECK souborů a sloučí je do jedné tabulky (seznam slovníků).
    """
    all_rows = []
    for p in paths:
        path = Path(p)
        if not path.exists():
            raise FileNotFoundError(f"Soubor neexistuje: {path}")
        label = path.name if include_source else None
        rows = _sheet_to_rows(path, label)
        all_rows.extend(rows)

    if not all_rows:
        return all_rows
    # Sjednotit sloupce napříč soubory
    return _normalize_columns(all_rows, None)


def export_csv(rows: list[dict], out_path: str | Path) -> None:
    """Export do CSV (UTF-8, středník nebo čárka jako oddělovač)."""
    if not rows:
        with open(out_path, "w", encoding="utf-8", newline="") as f:
            f.write("")
        return
    keys = list(rows[0].keys())
    with open(out_path, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=keys, delimiter=";", lineterminator="\n")
        w.writeheader()
        w.writerows(rows)


def export_json(rows: list[dict], out_path: str | Path) -> None:
    """Export do JSON (jeden řádek = jeden objekt v poli)."""
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)


def export_to_io_csv(rows: list[dict], columns: list[str] | None = None) -> str:
    """Vrátí obsah CSV jako řetězec. Pokud je columns zadáno, exportuje jen tyto sloupce (v pořadí)."""
    if not rows:
        return ""
    keys = columns if columns else list(rows[0].keys())
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=keys, delimiter=";", lineterminator="\n", extrasaction="ignore")
    w.writeheader()
    for row in rows:
        w.writerow({k: row.get(k, "") for k in keys})
    return buf.getvalue()


def main() -> int:
    parser = argparse.ArgumentParser(description="Export PVCHECK .ZST souborů do jedné tabulky (CSV/JSON).")
    parser.add_argument("files", nargs="+", help="Cesta k .ZST souborům (nebo adresář)")
    parser.add_argument("-o", "--output", default=None, help="Výstupní soubor (CSV nebo JSON)")
    parser.add_argument("--json", action="store_true", help="Výstup jako JSON (default CSV)")
    parser.add_argument("--no-source", action="store_true", help="Nepřidávat sloupec source_file")
    args = parser.parse_args()

    paths = []
    for p in args.files:
        path = Path(p)
        if path.is_dir():
            paths.extend(sorted(path.glob("*.ZST")) + sorted(path.glob("*.zst")))
        else:
            paths.append(path)

    if not paths:
        print("Žádné .ZST soubory k zpracování.", file=sys.stderr)
        return 1

    try:
        rows = load_pvcheck_files(paths, include_source=not args.no_source)
    except Exception as e:
        print(f"Chyba při načítání: {e}", file=sys.stderr)
        return 1

    if not rows:
        print("Žádná data k exportu.", file=sys.stderr)
        return 0

    if args.output:
        out = Path(args.output)
        if args.json:
            export_json(rows, out)
        else:
            export_csv(rows, out)
        print(f"Export dokončen: {len(rows)} řádků → {out}")
    else:
        # Výstup na stdout (pro n8n nebo pipe)
        if args.json:
            print(json.dumps(rows, ensure_ascii=False))
        else:
            print(export_to_io_csv(rows))

    return 0


if __name__ == "__main__":
    sys.exit(main())
