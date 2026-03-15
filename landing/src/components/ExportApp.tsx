import { useState, useCallback, useEffect, useRef } from "react";
import { uploadFiles, exportCsv, logout, adminLogin, isLoggedIn } from "../lib/api";

function GroupHeader({
  groupName,
  columns,
  selectedColumns,
  onToggle,
}: {
  groupName: string;
  columns: ColumnGroup;
  selectedColumns: Set<string>;
  onToggle: () => void;
}) {
  const allSelected = columns.every(([n]) => selectedColumns.has(n));
  const anySelected = columns.some(([n]) => selectedColumns.has(n));
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = anySelected && !allSelected;
  }, [anySelected, allSelected]);
  return (
    <div className="px-4 py-3 bg-white/5 border-b border-white/10">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          checked={allSelected}
          onChange={onToggle}
          className="rounded border-white/30 text-emerald-500 focus:ring-emerald-500"
        />
        <span className="font-medium text-white">{groupName}</span>
      </label>
    </div>
  );
}

const DEFAULT_COLUMNS = [
  "source_file", "Name", "M1", "M2", "M3", "Num", "DateTime",
  "Irraggiamento", "Irraggiamento_unit", "Temperatura", "Temperatura_unit",
  "Voc avg", "Voc avg_unit", "Isc avg", "Isc avg_unit",
  "Voc opc", "Voc opc_unit", "Isc opc", "Isc opc_unit",
  "Voc stc", "Voc stc_unit", "Isc stc", "Isc stc_unit",
  "RI", "RI_unit", "Vtest", "Vtest_unit", "RPE", "RPE_unit", "I Test", "I Test_unit",
];

type ColumnGroup = [string, string][];

export default function ExportApp() {
  const [columnsByGroup, setColumnsByGroup] = useState<Record<string, ColumnGroup> | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set(DEFAULT_COLUMNS));

  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).querySelector('input[type="file"]') as HTMLInputElement;
    const files = input?.files;
    if (!files?.length) {
      showMessage("error", "Vyberte alespoň jeden soubor .ZST.");
      return;
    }
    const fileList = Array.from(files).filter((f) => f.name.toLowerCase().endsWith(".zst"));
    if (!fileList.length) {
      showMessage("error", "Žádný platný soubor .ZST.");
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const data = await uploadFiles(fileList);
      setColumnsByGroup(data.columns_by_group);
      setRowCount(data.row_count);
      const allCols = Object.values(data.columns_by_group).flat().map(([name]) => name);
      setSelectedColumns(new Set(allCols.filter((c) => DEFAULT_COLUMNS.includes(c))));
      showMessage("success", `Načteno ${data.row_count} měření ze ${fileList.length} souborů.`);
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Chyba při nahrávání");
    } finally {
      setUploading(false);
    }
  };

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  };

  const toggleGroup = (groupName: string) => {
    const cols = columnsByGroup?.[groupName] ?? [];
    const names = cols.map(([n]) => n);
    const allSelected = names.every((n) => selectedColumns.has(n));
    setSelectedColumns((prev) => {
      const next = new Set(prev);
      names.forEach((n) => (allSelected ? next.delete(n) : next.add(n)));
      return next;
    });
  };

  const selectAll = () => {
    if (!columnsByGroup) return;
    const all = Object.values(columnsByGroup).flat().map(([n]) => n);
    setSelectedColumns(new Set(all));
  };

  const deselectAll = () => setSelectedColumns(new Set());

  const handleExport = async () => {
    const cols = Array.from(selectedColumns);
    if (!cols.length) {
      showMessage("error", "Vyberte alespoň jeden sloupec k exportu.");
      return;
    }
    setExporting(true);
    setMessage(null);
    try {
      const blob = await exportCsv(cols);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_pvcheck_${new Date().toISOString().slice(0, 10)}_${Date.now().toString(36)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showMessage("success", "CSV exportován.");
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Chyba při exportu");
    } finally {
      setExporting(false);
    }
  };

  const [adminMode, setAdminMode] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  const loggedIn = isLoggedIn();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError("");
    try {
      await adminLogin(adminUser, adminPass);
      setAdminMode(false);
      setAdminUser("");
      setAdminPass("");
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : "Chyba přihlášení");
    } finally {
      setAdminLoading(false);
    }
  };

  if (!loggedIn && !adminMode) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 max-w-md">
          <h2 className="text-xl font-semibold text-white mb-4">Přihlášení vyžadováno</h2>
          <p className="text-slate-400 mb-6">
            Pro přístup k aplikaci se přihlaste na hlavní stránce a dokončete nákup.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="inline-block px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
            >
              Zpět na úvodní stránku
            </a>
            <button
              type="button"
              onClick={() => setAdminMode(true)}
              className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 text-slate-300 font-medium transition-colors"
            >
              Admin přihlášení
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!loggedIn && adminMode) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 max-w-md w-full">
          <h2 className="text-xl font-semibold text-white mb-6">Admin přihlášení</h2>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Uživatel</label>
              <input
                type="text"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Heslo</label>
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            {adminError && <p className="text-sm text-rose-400">{adminError}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={adminLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium disabled:opacity-60"
              >
                {adminLoading ? "…" : "Přihlásit"}
              </button>
              <button
                type="button"
                onClick={() => { setAdminMode(false); setAdminError(""); }}
                className="px-4 py-3 rounded-xl border border-white/20 hover:bg-white/10 text-slate-300"
              >
                Zpět
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-950/50 via-slate-950 to-emerald-950/30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <a href="/" className="text-xl font-bold tracking-tight text-white/95 hover:text-white transition-colors" style={{ fontFamily: "Outfit, system-ui, sans-serif" }}>
            PVCHECK Export
          </a>
          <button
            type="button"
            onClick={async () => { await logout(); window.location.href = "/"; }}
            className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors"
          >
            Odhlásit
          </button>
        </header>

        {/* Upload */}
        <section className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">Nahrát soubory</h2>
          <p className="text-slate-400 text-sm mb-6">
            Vyberte jeden nebo více souborů .ZST (výstupy z měřicích přístrojů). Po potvrzení se načtou data a můžete vybrat sloupce k exportu.
          </p>
          <form onSubmit={handleUpload} className="flex flex-wrap gap-4 items-end">
            <label className="flex-1 min-w-[200px]">
              <span className="sr-only">Soubory .ZST</span>
              <input
                type="file"
                name="files"
                accept=".zst,.ZST"
                multiple
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-500/20 file:text-emerald-400 file:font-medium file:cursor-pointer hover:file:bg-emerald-500/30"
              />
            </label>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-medium transition-colors"
            >
              {uploading ? "Načítám…" : "Načíst data"}
            </button>
          </form>
        </section>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl ${
              message.type === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Columns */}
        {columnsByGroup && Object.keys(columnsByGroup).length > 0 && (
          <section className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8">
            <h2 className="text-xl font-semibold text-white mb-2">Výběr sloupců k exportu</h2>
            <p className="text-slate-400 text-sm mb-6">Zaškrtněte sloupce, které chcete zahrnout. Zobrazeno {rowCount} měření.</p>
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={selectAll}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-medium transition-colors"
              >
                Vybrat vše
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-medium transition-colors"
              >
                Zrušit vše
              </button>
            </div>
            <div className="space-y-6">
              {Object.entries(columnsByGroup).map(([groupName, columns]) => (
                <div key={groupName} className="border border-white/10 rounded-xl overflow-hidden">
                  <GroupHeader
                    groupName={groupName}
                    columns={columns}
                    selectedColumns={selectedColumns}
                    onToggle={() => toggleGroup(groupName)}
                  />
                  <ul className="divide-y divide-white/5 max-h-48 overflow-y-auto">
                    {columns.map(([colName, colDesc]) => (
                      <li key={colName} className="px-4 py-2 hover:bg-white/5">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedColumns.has(colName)}
                            onChange={() => toggleColumn(colName)}
                            className="rounded border-white/30 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className="text-slate-300 font-mono text-sm">{colName}</span>
                          <span className="text-slate-500 text-xs truncate flex-1" title={colDesc}>{colDesc}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold transition-all hover:scale-[1.02]"
              >
                {exporting ? "Exportuji…" : "Export CSV"}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
