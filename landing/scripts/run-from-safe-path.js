#!/usr/bin/env node
/**
 * Spustí dev server z cesty bez diakritiky.
 * Chyba "Cannot read properties of undefined (reading 'call')" vzniká
 * když je projekt ve složce se speciálními znaky (např. ZAKÁZKY).
 */
import { cpSync, existsSync, rmSync } from "fs";
import { join } from "path";
import { spawn } from "child_process";

const safeDir = join(process.env.HOME || "/tmp", "pvcheck-landing-dev");
const sourceDir = process.cwd();

console.log("Kopíruji projekt do", safeDir, "...");
if (existsSync(safeDir)) rmSync(safeDir, { recursive: true });
cpSync(sourceDir, safeDir, {
  recursive: true,
  filter: (src) => !src.includes("node_modules") && !src.includes(".git") && !src.includes("dist"),
});

console.log("Instaluji závislosti...");
const install = spawn("npm", ["install"], { cwd: safeDir, stdio: "inherit", shell: true });
install.on("close", (code) => {
  if (code !== 0) process.exit(code);
  console.log("Spouštím dev server z cesty bez diakritiky...\n");
  const dev = spawn("npm", ["run", "dev"], { cwd: safeDir, stdio: "inherit", shell: true });
  dev.on("close", (c) => process.exit(c || 0));
});
