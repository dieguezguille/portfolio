import { expect, test } from "@playwright/test";

import routes from "./routes";

test.describe("without javascript", () => {
  test.use({ javaScriptEnabled: false });

  test("the whole home page is readable", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Guillermo Diéguez" })).toBeVisible();
    for (const name of ["Selected work", "Experience", "Capabilities", "Contributions", "Contact"]) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeAttached();
    }
    const studies = routes.filter((route) => route.startsWith("/work/"));
    await expect(page.locator("#work li")).toHaveCount(studies.length);
    for (const route of studies) await expect(page.locator(`#work a[href="${route}"]`)).toBeVisible();
    await expect(page.locator("[data-palette-trigger]")).toBeHidden();
    await expect(page.locator(".fallback")).toBeVisible();
  });

  test("case studies and the cv render", async ({ page }) => {
    await page.goto("/work/exa");
    await expect(page.getByRole("heading", { level: 1, name: "Exa App" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Context" })).toBeVisible();
    await page.goto("/es/work/exa");
    await expect(page.getByRole("heading", { level: 1, name: "Exa App" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Contexto" })).toBeVisible();
    await page.goto("/cv");
    await expect(page.getByRole("heading", { level: 2, name: "Experience" })).toBeVisible();
  });
});

test("the css fallback stays when webgl is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.route("**/_astro/probe-*.js", (route) =>
    route.fulfill({ contentType: "text/javascript", body: "postMessage(true)" }),
  );
  const failure = page.waitForEvent("console", (message) => message.text().includes("Error creating WebGL context"));
  await page.goto("/");
  await failure;
  await expect(page.locator(".fallback")).toBeVisible();
  await expect(page.locator("[data-lattice] canvas")).toHaveCount(0);
  await expect(page.locator("[data-lattice] button")).toBeHidden();
});
