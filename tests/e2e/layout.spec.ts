import { expect, test } from "@playwright/test";
import { builtRoutes } from "./routes";

const routes = builtRoutes();

test.describe("reflow at 320px", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  for (const route of routes) {
    test(`${route} has no horizontal scroll`, async ({ page }) => {
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test("each page has exactly one h1 and a main landmark", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("h1"), route).toHaveCount(1);
    await expect(page.locator("main#main"), route).toHaveCount(1);
  }
});

test("skip link is the first focusable element and moves focus to main", async ({ page }) => {
  await page.goto("/earth/climate-change");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

test("content is visible without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/earth/climate-change");
  await expect(page.locator(".headline .number")).toBeVisible();
  await expect(page.locator("figure.chart svg")).toBeVisible();
  // The toggle needs JS, so it stays hidden rather than appearing broken.
  await expect(page.locator("[data-theme-toggle]")).toBeHidden();
  await context.close();
});
