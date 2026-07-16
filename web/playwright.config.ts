import { defineConfig, devices } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ?? "3010";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    headless: true,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next dev --turbopack -p ${port}`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 180_000,
    env: {
      ...process.env,
      // Force local file-fallback (middleware/auth no-op) for deterministic E2E
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      SUPABASE_URL: "",
      SUPABASE_ANON_KEY: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
      AXIAL_ALLOW_SEED: "true",
      EIS_DEMO_AUTO_ACK: "false",
      BIR_EIS_LIVE: "false",
      NODE_ENV: "development",
      PORT: port,
    },
  },
});
