import { defineConfig, devices } from "@playwright/test";

const host = "127.0.0.1";
const port = 4321;
const baseURL = `http://${host}:${port}`;

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  webServer: {
    command: `bun run preview -- --host ${host} --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: "chromium-mobile",
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: "firefox-desktop",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: "firefox-mobile",
      use: {
        browserName: "firefox",
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: "webkit-desktop",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: "webkit-mobile",
      use: {
        ...devices["iPhone 15"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
});
