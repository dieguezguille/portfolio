import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce", bypassCSP: true });

test.beforeEach(({ browserName, isMobile }) => {
  test.skip(browserName !== "chromium" || isMobile || !process.env.VISUAL, "runs in the playwright container only");
});

for (const colorScheme of ["dark", "light"] as const) {
  for (const width of [375, 768, 1440]) {
    for (const route of ["/", "/es/work/exa", "/cv"]) {
      test(`${route} in ${colorScheme} at ${width}px`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        await page.evaluate(() => document.fonts.ready);
        await expect(page).toHaveScreenshot({
          fullPage: true,
          mask: [page.locator("canvas"), page.locator(".clock"), page.locator(".metrics"), page.locator("footer dl")],
          stylePath: "e2e/visual.css",
        });
      });
    }
  }
}
