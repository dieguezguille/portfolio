import type { Page } from "@playwright/test";

export default async function visit(page: Page, route: string) {
  const probe = new Promise((resolve) => page.once("worker", (worker) => worker.once("close", resolve)));
  const response = await page.goto(route);
  if (await page.locator("[data-lattice]").count()) await probe;
  return response;
}
