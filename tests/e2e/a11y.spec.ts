import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { builtRoutes } from "./routes";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const routes = builtRoutes().filter((r) => r !== "/404");

for (const scheme of ["dark", "light"] as const) {
  test.describe(`${scheme} theme`, () => {
    test.use({ colorScheme: scheme });

    for (const route of routes) {
      test(`${route} has no axe violations`, async ({ page }) => {
        await page.goto(route);
        // Open every disclosure so hidden content (data tables, detail) is checked too.
        await page
          .locator("details")
          .evaluateAll((els) => els.forEach((el) => el.setAttribute("open", "")));
        const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
      });
    }
  });
}

test("404 page has no axe violations", async ({ page }) => {
  await page.goto("/404");
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);
});
