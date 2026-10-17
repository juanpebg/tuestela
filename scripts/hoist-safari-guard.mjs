// El guion de respaldo tiene que ejecutarse antes que los chunks async.
// Next los inserta al principio de <head>; aquí lo devolvemos al inicio
// después del build, en cada HTML exportado.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = fileURLToPath(new URL("../out/", import.meta.url));

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

const files = await htmlFiles(outDir);
if (files.length === 0) throw new Error("No hay HTML en out/.");

for (const file of files) {
  const html = await readFile(file, "utf8");
  const match = html.match(/<script id="estela-guard"[\s\S]*?<\/script>/);
  if (!match) throw new Error(`Falta #estela-guard en ${file}`);
  const without = html.replace(match[0], "");
  const head = without.indexOf("<head>");
  if (head === -1) throw new Error(`Falta <head> en ${file}`);
  const next = `${without.slice(0, head + 6)}${match[0]}${without.slice(head + 6)}`;
  const guardAt = next.indexOf('id="estela-guard"');
  const chunkAt = next.indexOf("<script src=");
  if (chunkAt !== -1 && guardAt > chunkAt) {
    throw new Error(`El guion no queda antes que los chunks en ${file}`);
  }
  await writeFile(file, next);
}
