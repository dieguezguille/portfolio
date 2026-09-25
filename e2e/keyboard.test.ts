import { expect, test } from "@playwright/test";

test.beforeEach(({ isMobile }) => {
  test.skip(isMobile, "keyboard flows run on desktop projects");
});

const tab = (browserName: string) => (browserName === "webkit" ? "Alt+Tab" : "Tab");

test("the skip link is the first focusable element and moves focus to main", async ({ page, browserName }) => {
  await page.goto("/");
  await page.keyboard.press(tab(browserName));
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("tab order follows the header", async ({ page, browserName }) => {
  await page.goto("/");
  const names = [];
  for (let step = 0; step < 7; step++) {
    await page.keyboard.press(tab(browserName));
    names.push(
      await page.evaluate(
        () => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent,
      ),
    );
  }
  expect(names.slice(0, 6)).toStrictEqual([
    "Skip to content",
    "Guillermo Diéguez, home",
    "Work",
    "About",
    "Contact",
    "Español",
  ]);
  expect(names[6]).toMatch(/^Command menu/);
});

test("the command palette works end to end with the keyboard", async ({ page }) => {
  await page.goto("/");
  const trigger = page.locator("[data-palette-trigger]");
  await trigger.focus();
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog", { name: "Command menu" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("combobox")).toBeFocused();
  await dialog.getByRole("combobox").fill("supra");
  await expect(dialog.getByRole("status")).toHaveText("Results: 1");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("combobox").fill("supra");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/supra-argentina$/);
});

test("g toggles the grid overlay outside inputs", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("g");
  await expect(page.locator("html")).toHaveAttribute("data-grid");
  await page.keyboard.press("g");
  await expect(page.locator("html")).not.toHaveAttribute("data-grid");
});

test("the pause button stops the lattice and remembers it", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "needs webgl 2 in headless mode");
  await page.route("**/_astro/probe-*.js", (route) =>
    route.fulfill({ contentType: "text/javascript", body: "postMessage(true)" }),
  );
  await page.goto("/");
  const pause = page.getByRole("button", { name: "Pause motion" });
  await expect(pause).toBeVisible({ timeout: 10_000 });
  await pause.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Resume motion" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("motion"))).toBe("paused");
  await page.reload();
  await expect(page.getByRole("button", { name: "Resume motion" })).toBeVisible({ timeout: 10_000 });
});
