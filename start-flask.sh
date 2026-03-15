#!/bin/bash
# Spustí Flask aplikaci (PVCHECK Export)
# Musí běžet, aby přihlášení z landingu fungovalo!

cd "$(dirname "$0")"

# Zkus venv; pokud selže (rozbitá cesta), použij systémový Python
if .venv/bin/python -c "import sys" 2>/dev/null; then
    .venv/bin/pip install -q -r requirements_web.txt 2>/dev/null
    exec .venv/bin/python web/app.py
fi

echo "Venv neexistuje nebo je rozbitý. Používám systémový Python..."
python3 -m pip install -q -r requirements_web.txt 2>/dev/null
exec python3 web/app.py
