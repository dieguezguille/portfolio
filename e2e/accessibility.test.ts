import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import routes from "./routes";
import visit from "./visit";

for (const colorScheme of ["dark", "light"] as const) {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test.describe(`in ${colorScheme} with reduced motion ${reducedMotion}`, () => {
      test.use({ colorScheme, reducedMotion });

      for (const route of [...routes, "/404"]) {
        test(`${route} has no axe violations`, async ({ page }) => {
          await visit(page, route);
          const results = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze();
          expect(results.violations).toStrictEqual([]);
        });
      }
    });
  }
}
