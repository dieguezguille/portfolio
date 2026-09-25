import type { AstroIntegration } from "astro";

import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export default function pdf(): AstroIntegration {
  let site = "";
  return {
    name: "pdf",
    hooks: {
      "astro:config:done": ({ config }) => {
        site = config.site ?? "";
      },
      "astro:build:done": async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.route("**/*", (route) => {
          const { pathname } = new URL(route.request().url());
          return route.fulfill({ path: path.join(root, path.extname(pathname) ? pathname : `${pathname}.html`) });
        });
        const papers = new Set(formats.values());
        for (const [cv, paper] of formats) {
          await page.goto(new URL(cv, site).href);
          await page.evaluate(() => document.fonts.ready);
          for (const format of papers) {
            const file = await page.pdf({ format });
            const pages = file.toString("latin1").match(/\/Type\s*\/Page\b/g)?.length;
            if (pages !== 1) throw new Error(`/${cv} prints on ${String(pages)} ${format} pages`);
            if (format === paper) await writeFile(path.join(root, `${cv}.pdf`), file);
          }
          logger.info(`/${cv}.pdf on ${paper}`);
        }
        await browser.close();
      },
    },
  };
}

const formats = new Map([
  ["cv", "Letter"],
  ["es/cv", "A4"],
]);
