import { readdirSync } from "node:fs";
import { join, relative } from "node:path";

/** Every page in the build output, as a URL path. Run `pnpm build` first. */
export function builtRoutes(distDir = join(process.cwd(), "dist")): string[] {
  const routes: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith(".html")) {
        const route = "/" + relative(distDir, path).replace(/\.html$/, "");
        routes.push(route === "/index" ? "/" : route);
      }
    }
  };
  walk(distDir);
  if (routes.length === 0) throw new Error(`No pages found in ${distDir}; run \`pnpm build\``);
  return routes.sort();
}
