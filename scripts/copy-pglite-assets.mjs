#!/usr/bin/env node
/**
 * Nitro's Vercel bundle inlines @electric-sql/pglite but does not copy the
 * sidecar wasm/data files. Without them, a preview/build without DATABASE_URL
 * crashes on first SQL. Production on Vercel should set DATABASE_URL (Neon);
 * this copy keeps local `vite preview` and a missing-DATABASE_URL fallback alive.
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules", "@electric-sql", "pglite", "dist");
const destDir = join(
  root,
  ".vercel",
  "output",
  "functions",
  "__server.func",
  "_libs",
);

const files = ["pglite.data", "pglite.wasm", "initdb.wasm"];

if (!existsSync(destDir)) {
  console.log("[pglite] no Vercel function output — skip");
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
for (const name of files) {
  const from = join(srcDir, name);
  if (!existsSync(from)) {
    console.warn(`[pglite] missing ${from}`);
    continue;
  }
  copyFileSync(from, join(destDir, name));
  console.log(`[pglite] copied ${name}`);
}
