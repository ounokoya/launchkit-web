import { defineConfig, devices } from '@playwright/test';

// Scenario A / B in the browser, at the three sizes of the design (1440, 768, 390 px).
// Needs the server stack (server/compose.yaml) and this app running: see README.
const baseURL = process.env.WEB_URL ?? 'http://localhost:5173';

export default defineConfig({
	testDir: 'tests/e2e',
	timeout: 90_000,
	fullyParallel: false,
	workers: 1,
	reporter: [['list']],
	use: { baseURL, trace: 'retain-on-failure', locale: 'fr-FR' },
	projects: [
		{ name: 'desktop-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
		{ name: 'tablet-768', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } } },
		{ name: 'phone-390', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
	]
});
