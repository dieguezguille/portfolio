// cspell:ignore requestfailed
import { expect, test } from "@playwright/test";

import routes from "./routes";
import visit from "./visit";

for (const route of routes) {
  test(`${route} loads without errors`, async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (
        ["error", "warning"].includes(message.type()) &&
        !/^\[\.WebGL|Failed to create WebGL context/.test(message.text())
      ) {
        problems.push(`${message.type()}: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => {
      problems.push(`pageerror: ${error.message}`);
    });
    page.on("requestfailed", (request) => {
      problems.push(`failed: ${request.url()}`);
    });
    const response = await visit(page, route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(problems).toStrictEqual([]);
  });
}

test("the header fits narrow screens without squeezing the monogram", async ({ page }) => {
  for (const path of ["/", "/es"]) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(path);
    const size = () => page.locator("header .home svg").evaluate((element) => element.getBoundingClientRect().width);
    const width = await size();
    for (const narrow of [320, 360, 390]) {
      await page.setViewportSize({ width: narrow, height: 800 });
      expect(await size()).toBe(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(narrow);
    }
  }
});

test("unknown routes answer 404 with a way home", async ({ page }) => {
  const response = await page.goto("/nothing-here");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "Back to the home page" })).toHaveAttribute("href", "/");
});

test("the spanish 404 is localized", async ({ page }) => {
  await page.goto("/es/404");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute("href", "/es");
});
