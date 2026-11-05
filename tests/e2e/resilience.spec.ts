// The API is unreachable: a second web server is started here, pointed at a closed port.
// Public pages still open; anything that needs the API shows a clear, translated message, never « Internal Error ».
import { spawn, type ChildProcess } from 'node:child_process';
import { dirname } from 'node:path';
import { expect, test } from '@playwright/test';
import { PASSWORD, capture, open } from './helpers';

const PORT = Number(process.env.E2E_DOWN_PORT ?? 4199);
const base = `http://127.0.0.1:${PORT}`;
let server: ChildProcess;

test.beforeAll(async () => {
	const env: NodeJS.ProcessEnv = { ...process.env, PORT: String(PORT), HOST: '127.0.0.1', API_URL: 'http://127.0.0.1:9' };
	delete env.ORIGIN;
	delete env.PROTOCOL_HEADER;
	server = spawn(process.execPath, ['server.js'], { cwd: dirname(test.info().config.configFile!), env, stdio: 'ignore' });
	await expect.poll(() => fetch(base).then((r) => r.status, () => 0), { timeout: 15_000 }).toBe(200);
});

test.afterAll(() => {
	server?.kill();
});

test('the API is unreachable: public pages open, the rest says so clearly', async ({ page, context }) => {
	expect((await open(page, `${base}/`))?.status()).toBe(200);
	expect((await open(page, `${base}/signup`))?.status()).toBe(200);

	// Signing in needs the API: the error page of the app, in French.
	await open(page, `${base}/login`);
	await page.fill('input[name=email]', 'marie@demo.test');
	await page.fill('input[name=password]', PASSWORD);
	await page.click('form button[type=submit]');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Un problème est survenu');
	await expect(page.locator('.lead')).toHaveText('Réessayez dans un instant. Si le problème continue, rechargez la page.');
	await capture(page, 'erreur-api-connexion');

	// Signed in (session cookie), every page needs the API: the last-resort page, status 500, no details.
	await context.addCookies([{ name: 'lk_session', value: 'jeton-de-test', url: base }]);
	const response = await page.goto(`${base}/app`);
	expect(response?.status()).toBe(500);
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Un problème est survenu');
	await expect(page.locator('main')).toContainText('Réessayez dans un instant.');
	await expect(page.locator('body')).not.toContainText(/Internal Error|ECONNREFUSED|fetch failed/);
	await expect(page.getByRole('link')).toHaveAttribute('href', '/');
	await capture(page, 'erreur-api-page-secours');
});
