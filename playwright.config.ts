import { defineConfig, devices } from '@playwright/test';

const appUrl = 'http://127.0.0.1:3101';
const backendUrl = 'http://127.0.0.1:4010';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  reporter: [['list']],
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: appUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'node e2e/mock-backend.cjs',
      url: `${backendUrl}/health`,
      reuseExistingServer: false,
      timeout: 30_000,
      env: {
        ...process.env,
        E2E_MOCK_BACKEND_PORT: '4010',
      },
    },
    {
      command: 'npm run dev -- --hostname 127.0.0.1 --port 3101',
      url: `${appUrl}/login`,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        ...process.env,
        BACKEND_API_URL: backendUrl,
        NEXT_PUBLIC_API_URL: backendUrl,
        NEXT_DIST_DIR: '.next-e2e',
        ADMIN_SESSION_SECRET: 'local-e2e-session-secret-do-not-use-in-production',
        NEXT_PUBLIC_PROMPTPAY_ID: '0812345678',
        NEXT_PUBLIC_PAYMENT_QR_MODE: 'promptpay',
        NEXT_PUBLIC_PROMPTPAY_DISPLAY_NAME: 'Glossy E2E',
        NEXT_PUBLIC_COMPANY_THAI_NAME: 'กรอสซี่ ทดสอบ',
        NEXT_PUBLIC_COMPANY_ENGLISH_NAME: 'GLOSSY E2E',
        NEXT_PUBLIC_COMPANY_BRANCH_NO: 'สำนักงานใหญ่',
        NEXT_PUBLIC_COMPANY_ADDRESS: '55 ถนนทดสอบ กรุงเทพมหานคร 10250',
        NEXT_PUBLIC_COMPANY_PHONE: '02-000-0000',
        NEXT_PUBLIC_COMPANY_TAX_ID: '0105555555555',
      },
    },
  ],
});
