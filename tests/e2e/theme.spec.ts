import { expect, test } from "@playwright/test";

const bg = (page: import("@playwright/test").Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

const DARK_BG = "rgb(11, 12, 14)";
const LIGHT_BG = "rgb(244, 242, 237)";

test.describe("follows the OS setting", () => {
  test.use({ colorScheme: "light" });

  test("light OS preference gives the light theme", async ({ page }) => {
    await page.goto("/");
    expect(await bg(page)).toBe(LIGHT_BG);
    await expect(page.locator("[data-theme-toggle]")).toHaveAttribute("aria-pressed", "false");
  });
});

test.describe("toggle", () => {
  test.use({ colorScheme: "dark" });

  test("overrides the OS setting and is remembered across pages", async ({ page }) => {
    await page.goto("/");
    expect(await bg(page)).toBe(DARK_BG);
    const toggle = page.getByRole("button", { name: "Dark theme" });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(await bg(page)).toBe(LIGHT_BG);

    await page.goto("/earth/climate-change");
    expect(await bg(page)).toBe(LIGHT_BG);
    await expect(page.getByRole("button", { name: "Dark theme" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("still works when storage is blocked", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("blocked", "SecurityError");
        },
      });
    });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await page.getByRole("button", { name: "Dark theme" }).click();
    expect(await bg(page)).toBe(LIGHT_BG);
    expect(errors).toEqual([]);
  });
});
