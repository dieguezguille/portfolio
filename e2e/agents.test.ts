import { expect, test } from "@playwright/test";

import routes from "./routes";

test("every page links a markdown version listed in llms.txt", async ({ page, request }) => {
  const index = await request.get("/llms.txt");
  expect(index.ok()).toBe(true);
  const listed = await index.text();
  for (const route of routes) {
    await page.goto(route);
    const href = await page.locator('link[rel="alternate"][type="text/markdown"]').getAttribute("href");
    expect(href).toMatch(/\.md$/);
    const response = await request.get(href ?? "");
    expect(response.ok()).toBe(true);
    expect(await response.text()).toMatch(/^# \S/);
    expect(listed).toContain(`https://guillermodieguez.com${href ?? ""}`);
  }
});

test("llms-full.txt holds every page", async ({ request }) => {
  const response = await request.get("/llms-full.txt");
  const text = await response.text();
  expect(text.match(/^# /gm)).toHaveLength(routes.length);
});

test("the page actions menu offers markdown and assistants", async ({ page, browserName, context, isMobile }) => {
  await page.goto("/work/exa");
  const trigger = page.getByRole("button", { name: /^MD/ });
  await trigger.click();
  const menu = page.locator("#agents");
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link", { name: "View as Markdown" })).toHaveAttribute("href", "/work/exa.md");
  for (const [name, origin] of [
    ["Open in ChatGPT", "https://chatgpt.com/"],
    ["Open in Claude", "https://claude.ai/new"],
  ] as const) {
    const href = (await menu.getByRole("link", { name }).getAttribute("href")) ?? "";
    expect(href.startsWith(origin)).toBe(true);
    expect(new URL(href).searchParams.get("q")).toContain("https://guillermodieguez.com/work/exa.md");
  }
  if (browserName === "chromium" && !isMobile) {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await menu.getByRole("button", { name: "Copy as Markdown" }).click();
    await expect(menu.getByRole("status")).toHaveText("Markdown copied to the clipboard");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/^# Exa App/);
  }
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
});

test("pages without markdown have no page actions", async ({ page }) => {
  await page.goto("/es/404");
  await expect(page.getByRole("button", { name: /^MD/ })).toHaveCount(0);
  await expect(page.locator('link[type="text/markdown"]')).toHaveCount(0);
});
