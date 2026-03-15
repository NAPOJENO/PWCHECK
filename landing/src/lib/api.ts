/** API URL – v dev přes proxy (/api), v produkci PUBLIC_API_URL */
function getApiBase(): string {
  if (typeof import.meta === "undefined") return "/api";
  const url = import.meta.env.PUBLIC_API_URL;
  return url && String(url).trim() ? String(url).replace(/\/$/, "") : "/api";
}

export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? getStoredToken() : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) {
    sessionStorage.setItem("pvcheck_token", token);
    window.history.replaceState({}, "", window.location.pathname);
    return token;
  }
  return sessionStorage.getItem("pvcheck_token");
}

export function clearStoredToken(): void {
  sessionStorage.removeItem("pvcheck_token");
  sessionStorage.removeItem("pvcheck_admin");
}

export async function logout(): Promise<void> {
  clearStoredToken();
  await fetch(`${getApiBase()}/logout`, { method: "POST", credentials: "include" });
}

export function isLoggedIn(): boolean {
  return !!(getStoredToken() || (typeof window !== "undefined" && sessionStorage.getItem("pvcheck_admin")));
}

export async function adminLogin(username: string, password: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Chyba přihlášení");
  }
  if (typeof window !== "undefined") sessionStorage.setItem("pvcheck_admin", "1");
}

export async function uploadFiles(files: File[]): Promise<{
  columns_by_group: Record<string, [string, string][]>;
  row_count: number;
}> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  // FormData – neposílat Content-Type, browser nastaví boundary

  const res = await fetch(`${getApiBase()}/upload`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Chyba při nahrávání");
  }
  return res.json();
}

export async function exportCsv(columns: string[]): Promise<Blob> {
  const res = await fetch(`${getApiBase()}/export`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ columns }),
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Chyba při exportu");
  }
  return res.blob();
}
