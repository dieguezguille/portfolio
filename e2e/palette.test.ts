import { expect, test } from "@playwright/test";

test.beforeEach(({ isMobile }) => {
  test.skip(isMobile, "the trigger is hidden on narrow screens");
});

test("a click outside closes the command palette and a click inside does not", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-palette-trigger]").click();
  const dialog = page.getByRole("dialog", { name: "Command menu" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("status").click();
  await expect(dialog).toBeVisible();
  const height = page.viewportSize()?.height ?? 0;
  await page.mouse.click(4, height - 4);
  await expect(dialog).toBeHidden();
});

test("the command palette opens a terminal that answers commands", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-palette-trigger]").click();
  const dialog = page.getByRole("dialog", { name: "Command menu" });
  const input = dialog.getByRole("combobox");
  await input.fill("> whoami");
  await input.press("Enter");
  await expect(dialog.getByRole("log")).toContainText("Guillermo Diéguez");
  await input.fill("> git log");
  await input.press("Enter");
  await expect(dialog.getByRole("log")).toContainText("Head of frontend, Exa Labs");
  await input.fill("> exit");
  await input.press("Enter");
  await expect(dialog).toBeHidden();
});
