"""
PVCHECK Export – webová aplikace.
Přihlášení: admin/admin NEBO token z landing (Supabase).
"""
import os
import sys
import csv
import io
import tempfile
from datetime import datetime
from pathlib import Path

# Přidat rodičovský adresář pro import pvcheck_export
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from pvcheck_export import load_pvcheck_files, export_to_io_csv

from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, session, flash, send_file, jsonify
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

app = Flask(__name__)

# CORS – v produkci přidej ALLOWED_ORIGINS (čárkou oddělené)
from flask_cors import CORS
_cors_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:4321,http://127.0.0.1:4321").split(",")
CORS(app, supports_credentials=True, origins=[o.strip() for o in _cors_origins if o.strip()])
app.secret_key = os.environ.get("SECRET_KEY", "pvcheck-dev-secret-change-in-production")
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024  # 100 MB
app.config["UPLOAD_FOLDER"] = Path(__file__).parent / "uploads"

# Přihlašovací údaje (fallback)
LOGIN_USER = "admin"
LOGIN_PASS = "admin"

# Supabase – pro ověření tokenu z landing
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")
PURCHASES_TABLE = "pvcheck_purchases"

# Výchozí sada sloupců pro jeden řádek měření
# Odpovídá seznamu parametrů z aplikace přístroje:
# Irraggiamento, Temperatura, Voc avg, Isc avg, Voc opc, Isc opc,
# Voc stc, Isc stc, Isolamento (RI, Vtest), Continuità (RPE, I Test)
DEFAULT_COLUMNS = [
    "source_file",
    "Name",
    "M1",
    "M2",
    "M3",
    "Num",
    "DateTime",
    "Irraggiamento",
    "Irraggiamento_unit",
    "Temperatura",
    "Temperatura_unit",
    "Voc avg",
    "Voc avg_unit",
    "Isc avg",
    "Isc avg_unit",
    "Voc opc",
    "Voc opc_unit",
    "Isc opc",
    "Isc opc_unit",
    "Voc stc",
    "Voc stc_unit",
    "Isc stc",
    "Isc stc_unit",
    "RI",
    "RI_unit",
    "Vtest",
    "Vtest_unit",
    "RPE",
    "RPE_unit",
    "I Test",
    "I Test_unit",
]

# Skupiny sloupců a popisy (pro přehledné UI)
COLUMN_GROUPS = {
    "Identifikační a obecné informace": {
        "source_file": "Název vstupního souboru (který přístroj / export)",
        "Name": "Typ testu nebo měření (např. I-V Check, MΩ Campo)",
        "M1": "Úroveň hierarchie 1 (např. plant)",
        "M2": "Úroveň hierarchie 2 (např. string)",
        "M3": "Úroveň hierarchie 3 (např. module)",
        "Num": "Interní číslo měření",
        "Type": "Typ záznamu (kód)",
        "Lenght": "Délka nebo počet vzorků",
        "DateTime": "Datum a čas měření",
        "text": "Textové pole / popis měření",
        "userText": "Poznámky operátora",
        "outC": "Metadata z původního souboru",
        "AHI": "Metadata z původního souboru",
        "Valtxt": "Metadata z původního souboru",
        "ValVal": "Metadata z původního souboru",
        "ValMU": "Metadata z původního souboru",
    },
    "Elektrické parametry a IV charakteristika": {
        "I Test": "Testovací proud",
        "I Test_unit": "Jednotka testovacího proudu",
        "Voc opc": "Napětí naprázdno při provozních podmínkách",
        "Voc opc_unit": "Jednotka Voc opc",
        "Isc opc": "Zkratový proud při provozních podmínkách",
        "Isc opc_unit": "Jednotka Isc opc",
        "Voc stc": "Napětí naprázdno přepočtené na STC",
        "Voc stc_unit": "Jednotka Voc stc",
        "Isc stc": "Zkratový proud přepočtený na STC",
        "Isc stc_unit": "Jednotka Isc stc",
        "Voc avg": "Průměrné napětí naprázdno",
        "Voc avg_unit": "Jednotka Voc avg",
        "Isc avg": "Průměrný zkratový proud",
        "Isc avg_unit": "Jednotka Isc avg",
        "V0 nom": "Nominální napětí",
        "V0 nom_unit": "Jednotka V0 nom",
        "Vnom": "Nominální napětí (řetězce)",
        "Vnom_unit": "Jednotka Vnom",
        "Vtest": "Testovací napětí",
        "Vtest_unit": "Jednotka Vtest",
        "VEN": "Napěťová úroveň",
        "VEN_unit": "Jednotka VEN",
        "VEP": "Napěťová úroveň",
        "VEP_unit": "Jednotka VEP",
        "VPN": "Napěťová úroveň",
        "VPN_unit": "Jednotka VPN",
        "Vmis (-)": "Odchylka napětí",
        "Vmis (-)_unit": "Jednotka Vmis (-)",
    },
    "Podmínky měření a prostředí": {
        "Irraggiamento": "Ozáření (irradiance), typicky W/m²",
        "Irraggiamento_unit": "Jednotka ozáření",
        "Irraggiamento minimo": "Minimální hodnota ozáření",
        "Irraggiamento minimo_unit": "Jednotka",
        "Temperatura": "Teplota (modul nebo okolí)",
        "Temperatura_unit": "Jednotka teploty",
        "Modalità temperatura": "Režim měření teploty",
        "Modalità temperatura_unit": "Jednotka",
        "Tol I": "Tolerance proudu",
        "Tol I_unit": "Jednotka (např. %)",
        "Tol V": "Tolerance napětí",
        "Tol V_unit": "Jednotka",
        "alpha": "Teplotní koeficient",
        "alpha_unit": "Jednotka (např. %/°C)",
        "beta": "Druhý teplotní koeficient",
        "beta_unit": "Jednotka",
    },
    "Izolace, odpor a bezpečnost": {
        "Isolamento": "Izolační odpor",
        "Isolamento_unit": "Jednotka",
        "R Lim": "Limit odporu",
        "R Lim_unit": "Jednotka",
        "Rlim": "Limit odporu",
        "Rlim_unit": "Jednotka",
        "Rmax": "Maximální odpor",
        "Rmax_unit": "Jednotka",
        "RI": "Odpor",
        "RI_unit": "Jednotka",
        "Ri": "Odpor",
        "Ri_unit": "Jednotka",
        "Ri +": "Odpor (kladná fáze)",
        "Ri +_unit": "Jednotka",
        "Ri -": "Odpor (záporná fáze)",
        "Ri -_unit": "Jednotka",
        "RPE": "Ochranný vodič / zemní odpor",
        "RPE_unit": "Jednotka",
        "Numero Moduli": "Počet modulů",
        "Numero Moduli_unit": "Jednotka",
        "Unità remota": "Informace o vzdálené jednotce",
        "Unità remota_unit": "Jednotka",
        "Continuità": "Kontinuita",
        "Continuità_unit": "Jednotka",
        "Informazioni generali": "Obecné informace",
        "Informazioni generali_unit": "Jednotka",
    },
    "Další / méně používané položky": {},
}


def _get_group_for_column(col: str) -> str:
    for group_name, cols in COLUMN_GROUPS.items():
        if col in cols:
            return group_name
    return "Další / méně používané položky"


def _get_description(col: str) -> str:
    for cols in COLUMN_GROUPS.values():
        if col in cols and cols.get(col):
            return cols[col]
    if col.endswith("_unit"):
        return "Jednotka hodnoty"
    return "Hodnota z měření"


def organize_columns_by_groups(all_columns: list[str]) -> dict[str, list[tuple[str, str]]]:
    """Rozdělí sloupce do skupin a vrátí { název_skupiny: [(sloupec, popis), ...] }."""
    grouped = {g: [] for g in COLUMN_GROUPS}
    for col in all_columns:
        group = _get_group_for_column(col)
        desc = COLUMN_GROUPS.get(group, {}).get(col) or _get_description(col)
        grouped[group].append((col, desc))
    return {k: v for k, v in grouped.items() if v}


def _verify_supabase_token(token: str) -> bool:
    """Ověří Supabase token a zkontroluje pvcheck_purchases. Vrátí True pokud OK."""
    if not token or not SUPABASE_URL or not SUPABASE_KEY:
        return False
    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            return False
        r = supabase.table(PURCHASES_TABLE).select("id").eq("user_id", user.user.id).limit(1).execute()
        if r.data and len(r.data) > 0:
            return True
    except Exception:
        pass
    return False


@app.before_request
def handle_supabase_token():
    """Pokud je v URL token z landing, ověř a přihlas."""
    token = request.args.get("token")
    if token and not session.get("logged_in"):
        if _verify_supabase_token(token):
            session["logged_in"] = True
            return redirect(url_for("index"))


def require_login(f):
    @wraps(f)
    def inner(*args, **kwargs):
        if not session.get("logged_in"):
            token = request.args.get("token")
            if token:
                return redirect(url_for("login", token=token))
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return inner


def _api_auth():
    """Ověří přístup pro API: session NEBO Authorization: Bearer <token>."""
    if session.get("logged_in"):
        return True
    auth = request.headers.get("Authorization")
    if auth and auth.startswith("Bearer "):
        token = auth[7:].strip()
        if _verify_supabase_token(token):
            session["logged_in"] = True
            return True
    return False


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        if session.get("logged_in"):
            return redirect(url_for("index"))
        return render_template("login.html")
    username = (request.form.get("username") or "").strip()
    password = (request.form.get("password") or "").strip()
    if username == LOGIN_USER and password == LOGIN_PASS:
        session["logged_in"] = True
        return redirect(url_for("index"))
    flash("Neplatné přihlašovací údaje.", "error")
    return render_template("login.html")


@app.route("/logout")
def logout():
    session.pop("logged_in", None)
    session.pop("data_path", None)
    return redirect(url_for("login"))


@app.route("/", methods=["GET", "POST"])
@require_login
def index():
    data_path = session.get("data_path")
    columns_by_group = None
    row_count = 0
    if request.method == "POST" and request.files and request.form.get("action") != "export":
        files = request.files.getlist("files")
        if not files or not any(f.filename for f in files):
            flash("Vyberte alespoň jeden soubor .ZST.", "error")
        else:
            upload_dir = Path(app.config["UPLOAD_FOLDER"])
            upload_dir.mkdir(parents=True, exist_ok=True)
            paths = []
            for f in files:
                if not f.filename or not (f.filename.lower().endswith(".zst")):
                    continue
                safe_name = os.path.basename(f.filename)
                path = upload_dir / safe_name
                f.save(str(path))
                paths.append(path)
            if not paths:
                flash("Žádný platný soubor .ZST.", "error")
            else:
                try:
                    rows = load_pvcheck_files(paths, include_source=True)
                    if not rows:
                        flash("Ze souborů se nepodařilo načíst žádná data.", "error")
                    else:
                        all_keys = sorted(set(k for row in rows for k in row))
                        # Uložit data do dočasného JSON souboru (session nemůže držet velká data)
                        fd, data_path = tempfile.mkstemp(suffix=".json", prefix="pvcheck_")
                        os.close(fd)
                        import json
                        with open(data_path, "w", encoding="utf-8") as out:
                            json.dump(rows, out, ensure_ascii=False)
                        session["data_path"] = data_path
                        flash(f"Načteno {len(rows)} měření ze {len(paths)} souborů. Vyberte sloupce a klikněte Export.", "success")
                        return redirect(url_for("index"))
                except Exception as e:
                    flash(f"Chyba při zpracování: {e}", "error")
                finally:
                    for p in paths:
                        try:
                            p.unlink(missing_ok=True)
                        except Exception:
                            pass
    elif data_path and Path(data_path).exists():
        import json
        with open(data_path, "r", encoding="utf-8") as f:
            rows = json.load(f)
        if rows:
            all_keys = sorted(set(k for row in rows for k in row))
            columns_by_group = organize_columns_by_groups(all_keys)
            row_count = len(rows)

    return render_template(
        "index.html",
        columns_by_group=columns_by_group,
        row_count=row_count,
        has_data=bool(columns_by_group),
        default_columns=DEFAULT_COLUMNS,
    )


@app.route("/api/logout", methods=["POST"])
def api_logout():
    session.pop("logged_in", None)
    session.pop("data_path", None)
    return jsonify({"ok": True})


@app.route("/api/login", methods=["POST"])
def api_login():
    """API: admin přihlášení, vrací token pro další požadavky."""
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    if username == LOGIN_USER and password == LOGIN_PASS:
        session["logged_in"] = True
        return jsonify({"ok": True})
    return jsonify({"error": "Neplatné přihlašovací údaje"}), 401


@app.route("/api/upload", methods=["POST"])
def api_upload():
    """API: nahrání .ZST souborů, vrací columns_by_group a row_count."""
    if not _api_auth():
        return jsonify({"error": "Neautorizováno"}), 401
    files = request.files.getlist("files")
    if not files or not any(f.filename for f in files):
        return jsonify({"error": "Vyberte alespoň jeden soubor .ZST."}), 400
    upload_dir = Path(app.config["UPLOAD_FOLDER"])
    upload_dir.mkdir(parents=True, exist_ok=True)
    paths = []
    try:
        for f in files:
            if not f.filename or not f.filename.lower().endswith(".zst"):
                continue
            safe_name = os.path.basename(f.filename)
            path = upload_dir / safe_name
            f.save(str(path))
            paths.append(path)
        if not paths:
            return jsonify({"error": "Žádný platný soubor .ZST."}), 400
        rows = load_pvcheck_files(paths, include_source=True)
        if not rows:
            return jsonify({"error": "Ze souborů se nepodařilo načíst žádná data."}), 400
        all_keys = sorted(set(k for row in rows for k in row))
        fd, data_path = tempfile.mkstemp(suffix=".json", prefix="pvcheck_")
        os.close(fd)
        import json
        with open(data_path, "w", encoding="utf-8") as out:
            json.dump(rows, out, ensure_ascii=False)
        session["data_path"] = data_path
        columns_by_group = organize_columns_by_groups(all_keys)
        return jsonify({
            "columns_by_group": {k: v for k, v in columns_by_group.items()},
            "row_count": len(rows),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        for p in paths:
            try:
                p.unlink(missing_ok=True)
            except Exception:
                pass


@app.route("/api/export", methods=["POST"])
def api_export():
    """API: export CSV, body: { columns: string[] }."""
    if not _api_auth():
        return jsonify({"error": "Neautorizováno"}), 401
    data_path = session.get("data_path")
    if not data_path or not Path(data_path).exists():
        return jsonify({"error": "Nejdříve nahrajte a načtěte soubory."}), 400
    data = request.get_json() or {}
    selected = data.get("columns") or []
    if not selected:
        return jsonify({"error": "Vyberte alespoň jeden sloupec k exportu."}), 400
    import json
    with open(data_path, "r", encoding="utf-8") as f:
        rows = json.load(f)
    csv_content = export_to_io_csv(rows, columns=selected)
    filename = f"export_pvcheck_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"
    return send_file(
        io.BytesIO(csv_content.encode("utf-8")),
        mimetype="text/csv; charset=utf-8",
        as_attachment=True,
        download_name=filename,
    )


@app.route("/export", methods=["POST"])
@require_login
def export_csv():
    data_path = session.get("data_path")
    if not data_path or not Path(data_path).exists():
        flash("Nejdříve nahrajte a načtěte soubory.", "error")
        return redirect(url_for("index"))
    selected = request.form.getlist("columns")
    if not selected:
        flash("Vyberte alespoň jeden sloupec k exportu.", "error")
        return redirect(url_for("index"))
    import json
    with open(data_path, "r", encoding="utf-8") as f:
        rows = json.load(f)
    csv_content = export_to_io_csv(rows, columns=selected)
    filename = f"export_pvcheck_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"
    return send_file(
        io.BytesIO(csv_content.encode("utf-8")),
        mimetype="text/csv; charset=utf-8",
        as_attachment=True,
        download_name=filename,
    )


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
