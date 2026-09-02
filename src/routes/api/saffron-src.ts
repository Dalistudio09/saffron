import { createFileRoute } from "@tanstack/react-router";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function findArchive() {
  const names = ["saffron.zip", "saffron-vercel.zip"];
  const dirs = [process.cwd(), join(process.cwd(), "public")];
  for (const dir of dirs) {
    for (const name of names) {
      const path = join(dir, name);
      if (existsSync(path)) return path;
    }
  }
  return "";
}

export const Route = createFileRoute("/api/saffron-src")({
  server: {
    handlers: {
      GET: async () => {
        const path = findArchive();
        if (!path) {
          return new Response("Архив ещё не собран", { status: 404 });
        }
        const body = readFileSync(path);
        return new Response(body, {
          headers: {
            "content-type": "application/zip",
            "content-disposition": 'attachment; filename="saffron-vercel.zip"',
            "content-length": String(body.length),
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
