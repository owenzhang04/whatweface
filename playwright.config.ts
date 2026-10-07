import { defineConfig, devices } from "@playwright/test";

// BASE_URL runs the suite against a deployed site (e.g. a Cloudflare preview) instead of a local build.
const baseURL = process.env.BASE_URL ?? "http://localhost:4321";

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "pnpm preview --port 4321",
        url: "http://localhost:4321",
        reuseExistingServer: !process.env.CI,
      },
});
