import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

export default async function budget(directory: string) {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  const files = new Map<string, Buffer>();
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const file = path.join(entry.parentPath, entry.name);
    files.set(path.relative(directory, file), await readFile(file));
  }
  const gzip = (name: string) => gzipSync(files.get(name) ?? "", { level: 9 }).length;
  const raw = (name: string) => files.get(name)?.length ?? 0;
  const sum = (names: string[], size = gzip) => names.reduce((total, name) => total + size(name), 0);
  const names = files.keys().toArray();
  const pages = names.filter((name) => name.endsWith(".html"));
  const scripts = names.filter((name) => name.endsWith(".js"));
  const scene = scripts.filter((name) => name.startsWith("_astro/mount."));
  const fonts = names.filter((name) => name.endsWith(".woff2"));
  const home = files.get("index.html")?.toString() ?? "";
  const referenced = home
    .matchAll(/(?:href|src)="\/(_astro\/[^"]+\.(?:css|js))"/g)
    .map((match) => match[1] ?? "")
    .toArray();
  const preloads = (name: string) =>
    files
      .get(name)
      ?.toString()
      .match(/rel="preload"[^>]*as="font"/g)?.length ?? 0;

  return [
    { name: "html", size: Math.max(...pages.map((name) => gzip(name))), limit: 30 * 1024 },
    { name: "css", size: sum(names.filter((name) => name.endsWith(".css"))), limit: 20 * 1024 },
    { name: "js", size: sum(scripts.filter((name) => !scene.includes(name))), limit: 15 * 1024 },
    { name: "scene", size: sum(scene), limit: 170 * 1024 },
    { name: "fonts", size: sum(fonts, raw), limit: 90 * 1024 },
    { name: "preloads", size: Math.max(...pages.map((name) => preloads(name))), limit: 2, unit: "files" },
    {
      name: "home",
      size: gzip("index.html") + sum([...new Set([...referenced, ...scene])]) + sum(fonts, raw),
      limit: 450 * 1024,
    },
  ];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rows = await budget("dist");
  const format = (value: number, unit?: string) => (unit ? `${value} ${unit}` : `${(value / 1024).toFixed(1)} kB`);
  for (const row of rows) {
    const status = row.size <= row.limit ? "ok  " : "FAIL";
    process.stdout.write(
      `${status}  ${row.name.padEnd(10)}${format(row.size, row.unit).padStart(10)}  / ${format(row.limit, row.unit)}\n`,
    );
  }
  process.exitCode = rows.some((row) => row.size > row.limit) ? 1 : 0;
}
